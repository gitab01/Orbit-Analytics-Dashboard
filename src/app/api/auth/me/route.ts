import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = req.cookies.get("orbit_session")?.value;
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  try {
    // atob works in Node 18+ and Edge Runtime
    const user = JSON.parse(atob(session));
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
