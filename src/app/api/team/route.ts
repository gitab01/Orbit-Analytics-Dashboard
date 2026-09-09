import { NextRequest, NextResponse } from "next/server";
import { db, hasDB } from "@/lib/db";
import { store, nextId } from "@/lib/store";
import type { MemberRole } from "@/lib/store";

export async function GET() {
  try {
    if (hasDB) {
      const rows = await db()`SELECT id, name, email, role, avatar, online FROM team_members ORDER BY id`;
      return NextResponse.json({ team: rows });
    }
    return NextResponse.json({ team: store.team });
  } catch (err) {
    console.error("[team GET]", err);
    return NextResponse.json({ team: store.team });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, role } = await req.json();
    if (!name || !email) return NextResponse.json({ error: "name and email required" }, { status: 400 });
    const avatar = name.split(" ").map((w: string) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("");

    if (hasDB) {
      const rows = await db()`INSERT INTO team_members (name, email, role, avatar, online) VALUES (${name}, ${email}, ${role ?? "Viewer"}, ${avatar}, FALSE) RETURNING id, name, email, role, avatar, online`;
      return NextResponse.json(rows[0], { status: 201 });
    }
    const member = { id: nextId(), name, email, role: (role ?? "Viewer") as MemberRole, avatar, online: false };
    store.team.push(member);
    return NextResponse.json(member, { status: 201 });
  } catch (err) {
    console.error("[team POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, role } = await req.json();
    if (hasDB) {
      const rows = await db()`UPDATE team_members SET role = ${role} WHERE id = ${id} RETURNING id, name, email, role, avatar, online`;
      if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(rows[0]);
    }
    const member = store.team.find(m => m.id === id);
    if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });
    member.role = role as MemberRole;
    return NextResponse.json(member);
  } catch (err) {
    console.error("[team PUT]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (hasDB) { await db()`DELETE FROM team_members WHERE id = ${id}`; }
    else { const idx = store.team.findIndex(m => m.id === id); if (idx !== -1) store.team.splice(idx, 1); }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[team DELETE]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
