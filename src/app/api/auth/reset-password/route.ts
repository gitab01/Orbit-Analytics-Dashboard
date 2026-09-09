import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql, hasDB } from "@/lib/db";
import { store } from "@/lib/store";
import { isValidEmail, isValidPassword } from "@/lib/validate";

// Verified emails waiting to set a new password (code already confirmed)
// In production: use a short-lived signed token instead
const verifiedResets = new Set<string>();

export function markEmailVerified(email: string) {
  verifiedResets.add(email.toLowerCase());
  // Auto-expire after 10 minutes
  setTimeout(() => verifiedResets.delete(email.toLowerCase()), 10 * 60 * 1000);
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email?.trim()) return NextResponse.json({ error: "Email is required" }, { status: 400 });
    if (!isValidEmail(email)) return NextResponse.json({ error: "Invalid email address" }, { status: 400 });

    const cleanEmail = email.toLowerCase().trim();

    // Require that the code was verified first
    if (!verifiedResets.has(cleanEmail)) {
      return NextResponse.json({ error: "Please verify your reset code first" }, { status: 403 });
    }

    const pwErr = isValidPassword(password ?? "");
    if (pwErr) return NextResponse.json({ error: pwErr }, { status: 400 });

    const hash = await bcrypt.hash(password, 10);

    if (hasDB && sql) {
      const rows = await sql`UPDATE users SET password_hash = ${hash} WHERE email = ${cleanEmail} RETURNING id`;
      if (!rows.length) return NextResponse.json({ error: "No account found with this email" }, { status: 404 });
    }
    // In-memory: we can't truly persist it but we clear the token so the flow completes

    verifiedResets.delete(cleanEmail);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[reset-password]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
