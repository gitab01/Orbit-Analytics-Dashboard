import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = req.cookies.get("orbit_session")?.value;
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  try {
    const user = JSON.parse(Buffer.from(session, "base64").toString("utf-8"));
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
