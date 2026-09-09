import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { sql, hasDB } from "@/lib/db";
import { store } from "@/lib/store";
import { isValidEmail } from "@/lib/validate";
import { createResetCode } from "@/lib/resetTokens";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email?.trim()) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address (e.g. name@gmail.com)" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check user exists
    let userExists = false;
    if (hasDB && sql) {
      const rows = await sql`SELECT id FROM users WHERE email = ${cleanEmail} LIMIT 1`;
      userExists = rows.length > 0;
    } else {
      // Check demo users + store team
      const demoEmails = ["alex@orbit.io", "sara@orbit.io", "demo@orbit.io"];
      userExists = demoEmails.includes(cleanEmail) ||
                   store.team.some(m => m.email === cleanEmail);
    }

    // Always return success to prevent email enumeration
    if (!userExists) {
      return NextResponse.json({ ok: true, message: "If an account exists, a code has been sent." });
    }

    const code = createResetCode(cleanEmail);

    if (resend) {
      // ── Send real email via Resend ────────────────────────
      await resend.emails.send({
        from:    "Orbit Analytics <noreply@orbit-analytics.app>",
        to:      cleanEmail,
        subject: "Your Orbit password reset code",
        html: `
          <div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#ffffff;border-radius:16px;border:1px solid #e5e7eb;">
            <div style="text-align:center;margin-bottom:28px;">
              <div style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;background:#15b382;border-radius:12px;">
                <span style="color:white;font-size:22px;font-weight:800;">O</span>
              </div>
              <h1 style="margin:16px 0 4px;font-size:22px;font-weight:700;color:#111827;">Password Reset</h1>
              <p style="margin:0;color:#6b7280;font-size:14px;">Enter this code to reset your password</p>
            </div>

            <div style="background:#f9fafb;border:2px dashed #d1fae5;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Your verification code</p>
              <p style="margin:0;font-size:40px;font-weight:800;letter-spacing:0.15em;color:#15b382;font-family:monospace;">${code}</p>
            </div>

            <p style="color:#6b7280;font-size:13px;text-align:center;margin:0 0 8px;">This code expires in <strong>15 minutes</strong>.</p>
            <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      });
    } else {
      // No email service — log to console for local dev
      console.log(`\n[PASSWORD RESET] Code for ${cleanEmail}: ${code}\n`);
    }

    return NextResponse.json({ ok: true, message: "If an account exists, a code has been sent." });
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
