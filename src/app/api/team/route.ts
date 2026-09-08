import { NextRequest, NextResponse } from "next/server";
import { store, nextId } from "@/lib/store";
import type { MemberRole } from "@/lib/store";

// GET team
export async function GET() {
  return NextResponse.json({ team: store.team });
}

// POST — invite member   body: { name, email, role }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const initials = body.name
    .split(" ")
    .map((w: string) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
  const member = { id: nextId(), name: body.name, email: body.email, role: (body.role ?? "Viewer") as MemberRole, avatar: initials, online: false };
  store.team.push(member);
  return NextResponse.json(member, { status: 201 });
}

// PUT — change role   body: { id, role }
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const member = store.team.find(m => m.id === body.id);
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });
  member.role = body.role as MemberRole;
  return NextResponse.json(member);
}

// DELETE — body: { id }
export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const idx = store.team.findIndex(m => m.id === body.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  store.team.splice(idx, 1);
  return NextResponse.json({ ok: true });
}
