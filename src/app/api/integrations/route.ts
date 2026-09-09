import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const rows = await sql`SELECT id, name, desc, logo, connected, category FROM integrations ORDER BY id`;
    return NextResponse.json({ integrations: rows });
  } catch (err) {
    console.error("[integrations GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id } = await req.json();
    const rows = await sql`
      UPDATE integrations SET connected = NOT connected
      WHERE id = ${id}
      RETURNING id, name, desc, logo, connected, category
    `;
    if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("[integrations PATCH]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
