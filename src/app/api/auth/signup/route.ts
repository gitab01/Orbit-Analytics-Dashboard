import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { createToken, COOKIE, MAX_AGE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
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

    const cleanEmail = email.toLowerCase().trim();

    // Check for duplicate
    const existing = await sql`SELECT id FROM users WHERE email = ${cleanEmail} LIMIT 1`;
    if (existing.length > 0) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const newUsers = await sql`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (${name.trim()}, ${cleanEmail}, ${passwordHash}, 'Viewer')
      RETURNING id, name, email, role
    `;
    const newUser = newUsers[0];

    // Create default profile
    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0] ?? name.trim();
    const lastName  = nameParts.slice(1).join(" ") || "";

    await sql`
      INSERT INTO profiles (user_id, first_name, last_name)
      VALUES (${newUser.id}, ${firstName}, ${lastName})
      ON CONFLICT (user_id) DO NOTHING
    `;

    const safeUser = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
    const token = await createToken(safeUser);

    const res = NextResponse.json({ ok: true, user: safeUser }, { status: 201 });
    res.cookies.set(COOKIE, token, {
      httpOnly: true,
      path: "/",
      maxAge: MAX_AGE,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (err) {
    console.error("[signup]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
