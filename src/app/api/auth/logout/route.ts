import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // Clear the cookie both ways for maximum compatibility
  res.cookies.set("orbit_session", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
    expires: new Date(0),
    sameSite: "lax",
  });
  return res;
}
