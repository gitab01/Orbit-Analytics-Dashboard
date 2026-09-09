import { NextRequest, NextResponse } from "next/server";

const USERS = [
  { id: "u1", name: "Alex Kim",     email: "alex@orbit.io",  password: "demo1234", role: "Admin"  },
  { id: "u2", name: "Sara Tadesse", email: "sara@orbit.io",  password: "demo1234", role: "Editor" },
  { id: "u3", name: "Demo User",    email: "demo@orbit.io",  password: "demo1234", role: "Viewer" },
];

// Use btoa (Web API) — works on both Node 18+ and Edge
function encodeSession(obj: object): string {
  return btoa(JSON.stringify(obj));
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const user = USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const { password: _, ...safeUser } = user;
  const session = encodeSession(safeUser);

  const res = NextResponse.json({ ok: true, user: safeUser });
  res.cookies.set("orbit_session", session, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax",
    // secure: true  ← uncomment when on HTTPS (Vercel sets this automatically)
  });

  return res;
}
