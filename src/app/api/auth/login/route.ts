import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql, hasDB } from "@/lib/db";
import { createToken, COOKIE, MAX_AGE } from "@/lib/auth";
import { isValidEmail } from "@/lib/validate";

// Demo users for fallback (no DB)
const DEMO_USERS = [
  { id:"u1", name:"Alex Kim",     email:"alex@orbit.io",  password:"demo1234", role:"Admin"  },
  { id:"u2", name:"Sara Tadesse", email:"sara@orbit.io",  password:"demo1234", role:"Editor" },
  { id:"u3", name:"Demo User",    email:"demo@orbit.io",  password:"demo1234", role:"Viewer" },
];

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email?.trim() || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    let safeUser: { id: string; name: string; email: string; role: string } | null = null;

    if (hasDB && sql) {
      // ── Database path ──────────────────────────────────────
      const rows = await sql`
        SELECT id, name, email, role, password_hash
        FROM users WHERE email = ${cleanEmail} LIMIT 1
      `;
      if (!rows.length) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      const user = rows[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid)  return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    } else {
      // ── In-memory fallback ────────────────────────────────
      const user = DEMO_USERS.find(u => u.email === cleanEmail && u.password === password);
      if (!user) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    }

    const token = await createToken(safeUser);
    const res   = NextResponse.json({ ok: true, user: safeUser });
    res.cookies.set(COOKIE, token, {
      httpOnly: true, path: "/", maxAge: MAX_AGE,
      sameSite: "lax", secure: process.env.NODE_ENV === "production",
    });
    return res;
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
