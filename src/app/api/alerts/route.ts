import { NextRequest, NextResponse } from "next/server";
import { store, nextId } from "@/lib/store";
import type { AlertStatus, AlertSeverity } from "@/lib/store";

// GET all alerts + rules
export async function GET() {
  return NextResponse.json({ alerts: store.alerts, rules: store.alertRules });
}

// POST — create new alert rule   body: { name, trigger, channel }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const rule = { id: nextId(), name: body.name, trigger: body.trigger, channel: body.channel, enabled: true };
  store.alertRules.push(rule);
  return NextResponse.json(rule, { status: 201 });
}

// PATCH — update alert or rule   body: { id, type:"alert"|"rule", ...fields }
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  if (body.type === "alert") {
    const alert = store.alerts.find(a => a.id === body.id);
    if (!alert) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (body.status) alert.status = body.status as AlertStatus;
    if (body.severity) alert.severity = body.severity as AlertSeverity;
    return NextResponse.json(alert);
  }
  if (body.type === "rule") {
    const rule = store.alertRules.find(r => r.id === body.id);
    if (!rule) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (typeof body.enabled === "boolean") rule.enabled = body.enabled;
    if (body.name) rule.name = body.name;
    if (body.trigger) rule.trigger = body.trigger;
    if (body.channel) rule.channel = body.channel;
    return NextResponse.json(rule);
  }
  return NextResponse.json({ error: "type must be alert or rule" }, { status: 400 });
}

// DELETE — remove rule   body: { id }
export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const idx = store.alertRules.findIndex(r => r.id === body.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  store.alertRules.splice(idx, 1);
  return NextResponse.json({ ok: true });
}
