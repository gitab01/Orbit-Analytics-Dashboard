import { NextRequest, NextResponse } from "next/server";

// In-memory user registry (resets on cold start — swap for a DB in production)
export const registeredUsers: {
  id: string; name: string; email: string; password: string; role: string;
}[] = [
  { id: "u1", name: "Alex Kim",     email: "alex@orbit.io",  password: "demo1234", role: "Admin"  },
  { id: "u2", name: "Sara Tadesse", email: "sara@orbit.io",  password: "demo1234", role: "Editor" },
  { id: "u3", name: "Demo User",    email: "demo@orbit.io",  password: "demo1234", role: "Viewer" },
];

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  if (!name?.trim() || !email?.trim() || !password) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }

  const exists = registeredUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
  if (exists) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const newUser = {
    id: `u${Date.now()}`,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    role: "Viewer",
  };
  registeredUsers.push(newUser);

  const { password: _, ...safeUser } = newUser;
  const session = btoa(JSON.stringify(safeUser));

  const res = NextResponse.json({ ok: true, user: safeUser }, { status: 201 });
  res.cookies.set("orbit_session", session, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
  });

  return res;
}
