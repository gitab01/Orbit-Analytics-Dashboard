import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { createToken, COOKIE, MAX_AGE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Look up user in DB
    const rows = await sql`
      SELECT id, name, email, role, password_hash
      FROM users
      WHERE email = ${email.toLowerCase().trim()}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    const token = await createToken(safeUser);

    const res = NextResponse.json({ ok: true, user: safeUser });
    res.cookies.set(COOKIE, token, {
      httpOnly: true,
      path: "/",
      maxAge: MAX_AGE,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
