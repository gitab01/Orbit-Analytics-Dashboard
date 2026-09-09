import { NextRequest, NextResponse } from "next/server";
import { db, hasDB } from "@/lib/db";
import { store } from "@/lib/store";

export async function GET() {
  try {
    if (hasDB) {
      const rows = await db()`SELECT id, name, desc, logo, connected, category FROM integrations ORDER BY id`;
      return NextResponse.json({ integrations: rows });
    }
    return NextResponse.json({ integrations: store.integrations });
  } catch (err) {
    console.error("[integrations GET]", err);
    return NextResponse.json({ integrations: store.integrations });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (hasDB) {
      const rows = await db()`UPDATE integrations SET connected = NOT connected WHERE id = ${id} RETURNING id, name, desc, logo, connected, category`;
      if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(rows[0]);
    }
    const intg = store.integrations.find(i => i.id === id);
    if (!intg) return NextResponse.json({ error: "Not found" }, { status: 404 });
    intg.connected = !intg.connected;
    return NextResponse.json(intg);
  } catch (err) {
    console.error("[integrations PATCH]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
