import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

// GET all integrations
export async function GET() {
  return NextResponse.json({ integrations: store.integrations });
}

// PATCH — toggle connection   body: { id }
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const intg = store.integrations.find(i => i.id === body.id);
  if (!intg) return NextResponse.json({ error: "Not found" }, { status: 404 });
  intg.connected = !intg.connected;
  return NextResponse.json(intg);
}
