import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql, hasDB } from "@/lib/db";
import { createToken, COOKIE, MAX_AGE } from "@/lib/auth";
import { isValidEmail, isValidName, isValidPassword } from "@/lib/validate";
import { store, nextId } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    const nameErr = isValidName(name ?? "");
    if (nameErr) return NextResponse.json({ error: nameErr }, { status: 400 });
    if (!email?.trim()) return NextResponse.json({ error: "Email address is required" }, { status: 400 });
    if (!isValidEmail(email)) return NextResponse.json({ error: "Please enter a valid email address (e.g. name@company.com)" }, { status: 400 });
    const pwErr = isValidPassword(password ?? "");
    if (pwErr) return NextResponse.json({ error: pwErr }, { status: 400 });

    const cleanEmail = email.toLowerCase().trim();
    let safeUser: { id: string; name: string; email: string; role: string };

    if (hasDB && sql) {
      // ── Database path ──────────────────────────────────────
      const existing = await sql`SELECT id FROM users WHERE email = ${cleanEmail} LIMIT 1`;
      if (existing.length > 0) return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });

      const hash = await bcrypt.hash(password, 10);
      const rows = await sql`
        INSERT INTO users (name, email, password_hash, role)
        VALUES (${name.trim()}, ${cleanEmail}, ${hash}, 'Viewer')
        RETURNING id, name, email, role
      `;
      const newUser = rows[0];
      const nameParts = name.trim().split(" ");
      await sql`
        INSERT INTO profiles (user_id, first_name, last_name)
        VALUES (${newUser.id}, ${nameParts[0]}, ${nameParts.slice(1).join(" ") || ""})
        ON CONFLICT (user_id) DO NOTHING
      `;
      safeUser = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
    } else {
      // ── In-memory fallback ────────────────────────────────
      const exists = store.team.find(m => m.email === cleanEmail);
      // Also check if already a demo user
      const demoEmails = ["alex@orbit.io","sara@orbit.io","demo@orbit.io"];
      if (exists || demoEmails.includes(cleanEmail)) {
        return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
      }
      const id = nextId();
      const nameParts = name.trim().split(" ");
      const initials  = nameParts.map((w: string) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("");
      // Add to team so they can be found
      store.team.push({ id, name: name.trim(), email: cleanEmail, role: "Viewer", avatar: initials, online: true });
      safeUser = { id, name: name.trim(), email: cleanEmail, role: "Viewer" };
    }

    const token = await createToken(safeUser);
    const res   = NextResponse.json({ ok: true, user: safeUser }, { status: 201 });
    res.cookies.set(COOKIE, token, {
      httpOnly: true, path: "/", maxAge: MAX_AGE,
      sameSite: "lax", secure: process.env.NODE_ENV === "production",
    });
    return res;
  } catch (err) {
    console.error("[signup]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
