import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/lib/validate";
import { verifyResetCode } from "@/lib/resetTokens";
import { markEmailVerified } from "@/lib/resetVerified";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email?.trim() || !code?.trim()) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    if (!/^\d{6}$/.test(code.trim())) {
      return NextResponse.json({ error: "Code must be 6 digits" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const result = verifyResetCode(cleanEmail, code.trim());

    if (result === "ok") {
      markEmailVerified(cleanEmail); // allow password reset for next 10 min
      return NextResponse.json({ ok: true });
    }
    if (result === "expired")
      return NextResponse.json(
        { error: "This code has expired. Please request a new one." },
        { status: 400 }
      );
    if (result === "too_many_attempts")
      return NextResponse.json(
        { error: "Too many attempts. Please request a new code." },
        { status: 429 }
      );

    return NextResponse.json(
      { error: "Invalid code. Please check and try again." },
      { status: 400 }
    );
  } catch (err) {
    console.error("[verify-reset-code]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
