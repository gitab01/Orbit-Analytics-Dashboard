import { NextRequest, NextResponse } from "next/server";
import { sql, hasDB } from "@/lib/db";
import { createToken, COOKIE, MAX_AGE } from "@/lib/auth";
import { isValidEmail } from "@/lib/validate";
import { store, nextId } from "@/lib/store";
import { verifyEmailCode } from "@/lib/emailVerification";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email?.trim() || !code?.trim())
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    if (!isValidEmail(email))
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    if (!/^\d{6}$/.test(code.trim()))
      return NextResponse.json({ error: "Code must be 6 digits" }, { status: 400 });

    const cleanEmail = email.toLowerCase().trim();
    const result     = verifyEmailCode(cleanEmail, code.trim());

    if (result.status === "expired")
      return NextResponse.json({ error: "Code has expired. Please sign up again to get a new code." }, { status: 400 });
    if (result.status === "too_many_attempts")
      return NextResponse.json({ error: "Too many incorrect attempts. Please sign up again." }, { status: 429 });
    if (result.status === "invalid")
      return NextResponse.json({ error: "Invalid code. Please check and try again." }, { status: 400 });

    // result.status === "ok" guaranteed here — TypeScript needs explicit check
    if (result.status !== "ok")
      return NextResponse.json({ error: "Verification failed." }, { status: 400 });

    // ── Code is valid — create the user ───────────────────────
    const { name, passwordHash } = result;
    let safeUser: { id: string; name: string; email: string; role: string };

    if (hasDB && sql) {
      // Double-check email not registered between code issue and verify
      const existing = await sql`SELECT id FROM users WHERE email = ${cleanEmail} LIMIT 1`;
      if (existing.length > 0)
        return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });

      const rows = await sql`
        INSERT INTO users (name, email, password_hash, role, email_verified)
        VALUES (${name}, ${cleanEmail}, ${passwordHash}, 'Viewer', true)
        RETURNING id, name, email, role
      `;
      const newUser   = rows[0];
      const nameParts = name.split(" ");
      await sql`
        INSERT INTO profiles (user_id, first_name, last_name)
        VALUES (${newUser.id}, ${nameParts[0]}, ${nameParts.slice(1).join(" ") || ""})
        ON CONFLICT (user_id) DO NOTHING
      `;
      safeUser = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
    } else {
      // In-memory fallback
      const id        = nextId();
      const nameParts = name.split(" ");
      const initials  = nameParts.map((w: string) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("");
      store.team.push({ id, name, email: cleanEmail, role: "Viewer", avatar: initials, online: true });
      safeUser = { id, name, email: cleanEmail, role: "Viewer" };
    }

    // ── Issue auth token and set cookie ───────────────────────
    const token = await createToken(safeUser);
    const res   = NextResponse.json({ ok: true, user: safeUser }, { status: 201 });
    res.cookies.set(COOKIE, token, {
      httpOnly: true, path: "/", maxAge: MAX_AGE,
      sameSite: "lax", secure: process.env.NODE_ENV === "production",
    });
    return res;

  } catch (err) {
    console.error("[verify-email]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
