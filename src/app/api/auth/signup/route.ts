import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql, hasDB } from "@/lib/db";
import { isValidEmail, isValidName, isValidPassword } from "@/lib/validate";
import { store } from "@/lib/store";
import { createVerificationCode, hasPendingVerification, refreshVerificationCode } from "@/lib/emailVerification";
import { sendVerificationEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    // ── Validate inputs ────────────────────────────────────────
    const nameErr = isValidName(name ?? "");
    if (nameErr) return NextResponse.json({ error: nameErr }, { status: 400 });
    if (!email?.trim()) return NextResponse.json({ error: "Email address is required" }, { status: 400 });
    if (!isValidEmail(email)) return NextResponse.json({ error: "Please enter a valid Gmail address (e.g. name@gmail.com)" }, { status: 400 });
    const pwErr = isValidPassword(password ?? "");
    if (pwErr) return NextResponse.json({ error: pwErr }, { status: 400 });

    const cleanEmail = email.toLowerCase().trim();

    // ── Check if email already registered ─────────────────────
    if (hasDB && sql) {
      const existing = await sql`SELECT id FROM users WHERE email = ${cleanEmail} LIMIT 1`;
      if (existing.length > 0)
        return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    } else {
      const demoEmails = ["alex@orbit.io", "sara@orbit.io", "demo@orbit.io"];
      const exists = store.team.find(m => m.email === cleanEmail);
      if (exists || demoEmails.includes(cleanEmail))
        return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    // ── Hash password & create/refresh verification code ──────
    const passwordHash = await bcrypt.hash(password, 10);

    let code: string;
    if (hasPendingVerification(cleanEmail)) {
      // Resend case: refresh the code
      code = refreshVerificationCode(cleanEmail) ?? createVerificationCode(cleanEmail, name.trim(), passwordHash);
    } else {
      code = createVerificationCode(cleanEmail, name.trim(), passwordHash);
    }

    // ── Send verification email ────────────────────────────────
    const sent = await sendVerificationEmail(cleanEmail, name.trim(), code);

    if (!sent) {
      // Dev fallback — log to console
      console.log("\n══════════════════════════════════════════");
      console.log("  EMAIL VERIFICATION CODE (dev mode)");
      console.log(`  Email : ${cleanEmail}`);
      console.log(`  Code  : ${code}`);
      console.log("══════════════════════════════════════════\n");
    }

    return NextResponse.json({
      ok: true,
      message: "Verification code sent. Please check your email.",
    }, { status: 200 });

  } catch (err) {
    console.error("[signup]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
