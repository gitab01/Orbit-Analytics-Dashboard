import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

// GET — all alerts + rules
export async function GET() {
  try {
    const [alerts, rules] = await Promise.all([
      sql`
        SELECT id, title, description, severity, status, metric, value, threshold,
          CASE
            WHEN created_at > NOW() - INTERVAL '1 hour'   THEN EXTRACT(MINUTE FROM NOW() - created_at)::int || ' min ago'
            WHEN created_at > NOW() - INTERVAL '24 hours' THEN EXTRACT(HOUR   FROM NOW() - created_at)::int || ' hr ago'
            ELSE EXTRACT(DAY FROM NOW() - created_at)::int || ' days ago'
          END AS time
        FROM alerts ORDER BY created_at DESC
      `,
      sql`SELECT id, name, trigger, channel, enabled FROM alert_rules ORDER BY id`,
    ]);
    return NextResponse.json({ alerts, rules });
  } catch (err) {
    console.error("[alerts GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST — create alert rule
export async function POST(req: NextRequest) {
  try {
    const { name, trigger, channel } = await req.json();
    if (!name || !trigger) return NextResponse.json({ error: "name and trigger required" }, { status: 400 });

    const rows = await sql`
      INSERT INTO alert_rules (name, trigger, channel, enabled)
      VALUES (${name}, ${trigger}, ${channel ?? "Email"}, TRUE)
      RETURNING id, name, trigger, channel, enabled
    `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    console.error("[alerts POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH — update alert status or rule fields
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.type === "alert") {
      const rows = await sql`
        UPDATE alerts SET status = ${body.status} WHERE id = ${body.id}
        RETURNING id, title, description, severity, status, metric, value, threshold
      `;
      if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(rows[0]);
    }

    if (body.type === "rule") {
      const rows = await sql`
        UPDATE alert_rules
        SET
          enabled = COALESCE(${body.enabled ?? null}::boolean, enabled),
          name    = COALESCE(${body.name    ?? null}, name),
          trigger = COALESCE(${body.trigger ?? null}, trigger),
          channel = COALESCE(${body.channel ?? null}, channel)
        WHERE id = ${body.id}
        RETURNING id, name, trigger, channel, enabled
      `;
      if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(rows[0]);
    }

    return NextResponse.json({ error: "type must be alert or rule" }, { status: 400 });
  } catch (err) {
    console.error("[alerts PATCH]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE — remove alert rule
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await sql`DELETE FROM alert_rules WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[alerts DELETE]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
