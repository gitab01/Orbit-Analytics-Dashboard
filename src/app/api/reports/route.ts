import { NextRequest, NextResponse } from "next/server";
import { store, nextId } from "@/lib/store";
import type { ReportStatus } from "@/lib/store";

// GET all scheduled reports
export async function GET() {
  return NextResponse.json({ reports: store.scheduledReports });
}

// POST — create scheduled report   body: { name, freq, type }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const report = {
    id: nextId(),
    name: body.name,
    freq: body.freq,
    type: body.type ?? "kpi",
    last: "Never",
    status: "active" as ReportStatus,
  };
  store.scheduledReports.push(report);
  return NextResponse.json(report, { status: 201 });
}

// PATCH — toggle status   body: { id, status }
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const report = store.scheduledReports.find(r => r.id === body.id);
  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (body.status) report.status = body.status as ReportStatus;
  if (body.name) report.name = body.name;
  return NextResponse.json(report);
}

// DELETE — body: { id }
export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const idx = store.scheduledReports.findIndex(r => r.id === body.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  store.scheduledReports.splice(idx, 1);
  return NextResponse.json({ ok: true });
}
