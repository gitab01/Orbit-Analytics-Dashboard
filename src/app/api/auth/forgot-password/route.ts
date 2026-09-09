import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/lib/validate";
import { createResetCode } from "@/lib/resetTokens";
import { sendResetEmail } from "@/lib/mailer";
import { sql, hasDB } from "@/lib/db";
import { store } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email?.trim()) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Only Gmail addresses are accepted (e.g. name@gmail.com)" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // ── Check user exists ──────────────────────────────────────
    let userExists = false;
    if (hasDB && sql) {
      const rows = await sql`SELECT id FROM users WHERE email = ${cleanEmail} LIMIT 1`;
      userExists = rows.length > 0;
    } else {
      const demoEmails = ["alex@orbit.io", "sara@orbit.io", "demo@orbit.io"];
      userExists =
        demoEmails.includes(cleanEmail) ||
        store.team.some((m) => m.email === cleanEmail);
    }

    // Always return 200 to prevent email enumeration
    if (!userExists) {
      return NextResponse.json({
        ok: true,
        message: "If an account exists, a code has been sent.",
      });
    }

    const code = createResetCode(cleanEmail);

    // ── Send email ─────────────────────────────────────────────
    const sent = await sendResetEmail(cleanEmail, code);

    if (!sent) {
      // No email provider configured — log to console for dev
      console.log("\n══════════════════════════════════════════");
      console.log("  PASSWORD RESET CODE (dev mode)");
      console.log(`  Email : ${cleanEmail}`);
      console.log(`  Code  : ${code}`);
      console.log("══════════════════════════════════════════\n");
    }

    return NextResponse.json({
      ok: true,
      message: "If an account exists, a code has been sent.",
    });
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
