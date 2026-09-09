import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql, hasDB } from "@/lib/db";
import { isValidEmail, isValidPassword } from "@/lib/validate";
import { isEmailVerified, clearEmailVerified } from "@/lib/resetVerified";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email?.trim())
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    if (!isValidEmail(email))
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });

    const cleanEmail = email.toLowerCase().trim();

    // Require that the reset code was verified first
    if (!isEmailVerified(cleanEmail)) {
      return NextResponse.json(
        { error: "Please verify your reset code first" },
        { status: 403 }
      );
    }

    const pwErr = isValidPassword(password ?? "");
    if (pwErr) return NextResponse.json({ error: pwErr }, { status: 400 });

    const hash = await bcrypt.hash(password, 10);

    if (hasDB && sql) {
      const rows = await sql`
        UPDATE users SET password_hash = ${hash}
        WHERE email = ${cleanEmail}
        RETURNING id
      `;
      if (!rows.length)
        return NextResponse.json(
          { error: "No account found with this email" },
          { status: 404 }
        );
    }

    clearEmailVerified(cleanEmail);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[reset-password]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
