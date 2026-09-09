import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const rows = await sql`
      SELECT id, name, freq, last_sent AS "last", status, type
      FROM scheduled_reports ORDER BY id
    `;
    return NextResponse.json({ reports: rows });
  } catch (err) {
    console.error("[reports GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, freq, type } = await req.json();
    if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

    const rows = await sql`
      INSERT INTO scheduled_reports (name, freq, type, last_sent, status)
      VALUES (${name}, ${freq ?? "Every Monday"}, ${type ?? "kpi"}, 'Never', 'active')
      RETURNING id, name, freq, last_sent AS "last", status, type
    `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    console.error("[reports POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status, name } = await req.json();
    const rows = await sql`
      UPDATE scheduled_reports
      SET
        status = COALESCE(${status ?? null}, status),
        name   = COALESCE(${name   ?? null}, name)
      WHERE id = ${id}
      RETURNING id, name, freq, last_sent AS "last", status, type
    `;
    if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("[reports PATCH]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await sql`DELETE FROM scheduled_reports WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[reports DELETE]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
