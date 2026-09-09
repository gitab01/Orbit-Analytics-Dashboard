import { NextRequest, NextResponse } from "next/server";
import { db, hasDB } from "@/lib/db";
import { store, nextId } from "@/lib/store";
import type { ReportStatus } from "@/lib/store";

export async function GET() {
  try {
    if (hasDB) {
      const rows = await db()`SELECT id, name, freq, last_sent AS "last", status, type FROM scheduled_reports ORDER BY id`;
      return NextResponse.json({ reports: rows });
    }
    return NextResponse.json({ reports: store.scheduledReports });
  } catch (err) {
    console.error("[reports GET]", err);
    return NextResponse.json({ reports: store.scheduledReports });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, freq, type } = await req.json();
    if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
    if (hasDB) {
      const rows = await db()`INSERT INTO scheduled_reports (name, freq, type, last_sent, status) VALUES (${name}, ${freq ?? "Every Monday"}, ${type ?? "kpi"}, 'Never', 'active') RETURNING id, name, freq, last_sent AS "last", status, type`;
      return NextResponse.json(rows[0], { status: 201 });
    }
    const report = { id: nextId(), name, freq: freq ?? "Every Monday", type: type ?? "kpi", last: "Never", status: "active" as ReportStatus };
    store.scheduledReports.push(report);
    return NextResponse.json(report, { status: 201 });
  } catch (err) {
    console.error("[reports POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status, name } = await req.json();
    if (hasDB) {
      const rows = await db()`UPDATE scheduled_reports SET status=COALESCE(${status??null},status), name=COALESCE(${name??null},name) WHERE id=${id} RETURNING id, name, freq, last_sent AS "last", status, type`;
      if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(rows[0]);
    }
    const r = store.scheduledReports.find(r => r.id === id);
    if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (status) r.status = status as ReportStatus;
    if (name)   r.name   = name;
    return NextResponse.json(r);
  } catch (err) {
    console.error("[reports PATCH]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (hasDB) { await db()`DELETE FROM scheduled_reports WHERE id = ${id}`; }
    else { const idx = store.scheduledReports.findIndex(r => r.id === id); if (idx !== -1) store.scheduledReports.splice(idx, 1); }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[reports DELETE]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
