import { NextRequest, NextResponse } from "next/server";
import { db, hasDB } from "@/lib/db";
import { store, nextId } from "@/lib/store";
import type { AlertStatus } from "@/lib/store";

export async function GET() {
  try {
    if (hasDB) {
      const [alerts, rules] = await Promise.all([
        db()`SELECT id, title, description, severity, status, metric, value, threshold,
          CASE WHEN created_at > NOW()-INTERVAL '1 hour' THEN EXTRACT(MINUTE FROM NOW()-created_at)::int||' min ago'
               WHEN created_at > NOW()-INTERVAL '24 hours' THEN EXTRACT(HOUR FROM NOW()-created_at)::int||' hr ago'
               ELSE EXTRACT(DAY FROM NOW()-created_at)::int||' days ago' END AS time
          FROM alerts ORDER BY created_at DESC`,
        db()`SELECT id, name, trigger, channel, enabled FROM alert_rules ORDER BY id`,
      ]);
      return NextResponse.json({ alerts, rules });
    }
    return NextResponse.json({ alerts: store.alerts, rules: store.alertRules });
  } catch (err) {
    console.error("[alerts GET]", err);
    return NextResponse.json({ alerts: store.alerts, rules: store.alertRules });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, trigger, channel } = await req.json();
    if (!name || !trigger) return NextResponse.json({ error: "name and trigger required" }, { status: 400 });

    if (hasDB) {
      const rows = await db()`INSERT INTO alert_rules (name, trigger, channel, enabled) VALUES (${name}, ${trigger}, ${channel ?? "Email"}, TRUE) RETURNING id, name, trigger, channel, enabled`;
      return NextResponse.json(rows[0], { status: 201 });
    }
    const rule = { id: nextId(), name, trigger, channel: channel ?? "Email", enabled: true };
    store.alertRules.push(rule);
    return NextResponse.json(rule, { status: 201 });
  } catch (err) {
    console.error("[alerts POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.type === "alert") {
      if (hasDB) {
        const rows = await db()`UPDATE alerts SET status = ${body.status} WHERE id = ${body.id} RETURNING id, title, description, severity, status, metric, value, threshold`;
        if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(rows[0]);
      }
      const alert = store.alerts.find(a => a.id === body.id);
      if (!alert) return NextResponse.json({ error: "Not found" }, { status: 404 });
      alert.status = body.status as AlertStatus;
      return NextResponse.json(alert);
    }

    if (body.type === "rule") {
      if (hasDB) {
        const rows = await db()`UPDATE alert_rules SET
          enabled=COALESCE(${body.enabled??null}::boolean,enabled),
          name=COALESCE(${body.name??null},name),
          trigger=COALESCE(${body.trigger??null},trigger),
          channel=COALESCE(${body.channel??null},channel)
          WHERE id=${body.id} RETURNING id, name, trigger, channel, enabled`;
        if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(rows[0]);
      }
      const rule = store.alertRules.find(r => r.id === body.id);
      if (!rule) return NextResponse.json({ error: "Not found" }, { status: 404 });
      if (typeof body.enabled === "boolean") rule.enabled = body.enabled;
      if (body.name)    rule.name    = body.name;
      if (body.trigger) rule.trigger = body.trigger;
      if (body.channel) rule.channel = body.channel;
      return NextResponse.json(rule);
    }

    return NextResponse.json({ error: "type must be alert or rule" }, { status: 400 });
  } catch (err) {
    console.error("[alerts PATCH]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (hasDB) { await db()`DELETE FROM alert_rules WHERE id = ${id}`; }
    else {
      const idx = store.alertRules.findIndex(r => r.id === id);
      if (idx !== -1) store.alertRules.splice(idx, 1);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[alerts DELETE]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
