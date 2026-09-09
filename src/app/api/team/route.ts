import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const rows = await sql`SELECT id, name, email, role, avatar, online FROM team_members ORDER BY id`;
    return NextResponse.json({ team: rows });
  } catch (err) {
    console.error("[team GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, role } = await req.json();
    if (!name || !email) return NextResponse.json({ error: "name and email required" }, { status: 400 });

    const avatar = name.split(" ").map((w: string) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("");
    const rows = await sql`
      INSERT INTO team_members (name, email, role, avatar, online)
      VALUES (${name}, ${email}, ${role ?? "Viewer"}, ${avatar}, FALSE)
      RETURNING id, name, email, role, avatar, online
    `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    console.error("[team POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, role } = await req.json();
    const rows = await sql`
      UPDATE team_members SET role = ${role} WHERE id = ${id}
      RETURNING id, name, email, role, avatar, online
    `;
    if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("[team PUT]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await sql`DELETE FROM team_members WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[team DELETE]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
