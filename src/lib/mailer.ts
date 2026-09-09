/**
 * Mailer — sends transactional emails.
 *
 * Priority order:
 *  1. Resend API  (RESEND_API_KEY)        — works on Vercel, needs verified domain for sending to others
 *  2. Gmail SMTP  (GMAIL_USER + GMAIL_APP_PASSWORD) — works locally, blocked on Vercel
 *  3. Dev fallback — returns code in API response, shown on screen
 *
 * For Vercel production:
 *   - Get a free API key at https://resend.com
 *   - Add RESEND_API_KEY to Vercel → Settings → Environment Variables
 *   - For sending to ANY address (not just your own), verify a domain at resend.com/domains
 *     OR use RESEND_TO_OVERRIDE to redirect all emails to your own address during testing
 */

// ── Shared HTML builder ───────────────────────────────────────
function buildEmailShell(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Inter,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0"
        style="background:#ffffff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;max-width:480px;width:100%;">
        <tr>
          <td style="background:#111827;padding:24px 32px;text-align:center;">
            <div style="display:inline-flex;align-items:center;justify-content:center;
              width:44px;height:44px;background:#15b382;border-radius:10px;margin-bottom:10px;">
              <span style="color:#fff;font-size:20px;font-weight:800;line-height:1;">O</span>
            </div>
            <h1 style="margin:0;font-size:18px;font-weight:700;color:#ffffff;">Orbit Analytics</h1>
          </td>
        </tr>
        <tr><td style="padding:32px;">${bodyHtml}</td></tr>
        <tr>
          <td style="background:#f9fafb;padding:14px 32px;border-top:1px solid #f3f4f6;">
            <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
              © ${new Date().getFullYear()} Orbit Analytics. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}

function codeBox(code: string, label: string): string {
  return `
  <div style="background:#f0fdf4;border:2px dashed #86efac;border-radius:12px;
    padding:24px 16px;text-align:center;margin:20px 0;">
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#6b7280;
      text-transform:uppercase;letter-spacing:0.08em;">${label}</p>
    <p style="margin:0;font-size:40px;font-weight:800;letter-spacing:0.25em;
      color:#15b382;font-family:'Courier New',monospace;">${code}</p>
    <p style="margin:8px 0 0;font-size:12px;color:#9ca3af;">Expires in 15 minutes</p>
  </div>`;
}

function verificationHtml(name: string, code: string): string {
  const first = name.split(" ")[0] || name;
  return buildEmailShell(`
    <h2 style="margin:0 0 8px;font-size:18px;font-weight:700;color:#111827;">Confirm your email</h2>
    <p style="margin:0 0 4px;font-size:14px;color:#6b7280;line-height:1.6;">
      Hi <strong>${first}</strong>, thanks for signing up for Orbit Analytics!
    </p>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
      Enter the code below to verify your email and activate your account.
    </p>
    ${codeBox(code, "Email verification code")}
    <p style="margin:0;font-size:13px;color:#9ca3af;">
      If you didn't create an Orbit account, you can safely ignore this email.
    </p>
  `);
}

function resetHtml(code: string): string {
  return buildEmailShell(`
    <h2 style="margin:0 0 8px;font-size:18px;font-weight:700;color:#111827;">Reset your password</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6;">
      We received a request to reset your Orbit Analytics password.
      Use the code below to continue.
    </p>
    ${codeBox(code, "Password reset code")}
    <p style="margin:0;font-size:13px;color:#9ca3af;">
      If you didn't request this, you can safely ignore this email.
    </p>
  `);
}

// ── Core send via Resend HTTP API ─────────────────────────────
async function sendViaResend(
  to: string, subject: string, html: string, text: string
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith("re_xxx")) return false;

  // If RESEND_TO_OVERRIDE is set, redirect all emails there (useful for testing)
  const recipient = process.env.RESEND_TO_OVERRIDE || to;
  const from      = process.env.RESEND_FROM_EMAIL || "Orbit Analytics <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: recipient, subject, html, text }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[mailer] Resend API error:", err);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[mailer] Resend fetch failed:", err);
    return false;
  }
}

// ── Core send via Gmail SMTP (local dev only) ─────────────────
async function sendViaGmail(
  to: string, subject: string, html: string, text: string
): Promise<boolean> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass || pass.includes("xxxx")) return false;

  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
    await transporter.sendMail({
      from: `"Orbit Analytics" <${user}>`,
      to, subject, text, html,
    });
    return true;
  } catch (err) {
    console.error("[mailer] Gmail SMTP failed:", err);
    return false;
  }
}

// ── Public API ────────────────────────────────────────────────

export async function sendVerificationEmail(
  to: string, name: string, code: string
): Promise<boolean> {
  const subject = "Confirm your Orbit account";
  const html    = verificationHtml(name, code);
  const text    = `Hi ${name},\n\nYour Orbit verification code is: ${code}\n\nExpires in 15 minutes.`;

  return (await sendViaResend(to, subject, html, text))
      || (await sendViaGmail(to, subject, html, text));
}

export async function sendResetEmail(
  to: string, code: string
): Promise<boolean> {
  const subject = "Your Orbit password reset code";
  const html    = resetHtml(code);
  const text    = `Your Orbit password reset code is: ${code}\n\nExpires in 15 minutes.`;

  return (await sendViaResend(to, subject, html, text))
      || (await sendViaGmail(to, subject, html, text));
}
