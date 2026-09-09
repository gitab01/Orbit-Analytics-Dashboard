/**
 * Mailer — sends transactional emails via Resend (HTTP, Vercel-compatible).
 *
 * Setup:
 *  1. Sign up free at https://resend.com (100 emails/day free)
 *  2. Create an API key
 *  3. Add RESEND_API_KEY to Vercel env vars (Settings → Environment Variables)
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
        <!-- Header -->
        <tr>
          <td style="background:#111827;padding:28px 32px;text-align:center;">
            <div style="display:inline-flex;align-items:center;justify-content:center;
              width:48px;height:48px;background:#15b382;border-radius:12px;margin-bottom:12px;">
              <span style="color:#ffffff;font-size:22px;font-weight:800;line-height:1;">O</span>
            </div>
            <h1 style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">
              Orbit Analytics
            </h1>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:32px;">${bodyHtml}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #f3f4f6;">
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

function buildCodeBox(code: string, label: string): string {
  return `
    <div style="background:#f9fafb;border:2px dashed #a7f3d0;border-radius:12px;
      padding:28px 16px;text-align:center;margin-bottom:24px;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#6b7280;
        text-transform:uppercase;letter-spacing:0.08em;">${label}</p>
      <p style="margin:0;font-size:42px;font-weight:800;letter-spacing:0.2em;
        color:#15b382;font-family:'Courier New',Courier,monospace;">${code}</p>
    </div>`;
}

// ── Email: signup verification ────────────────────────────────
function buildVerificationHtml(name: string, code: string): string {
  const firstName = name.split(" ")[0] || name;
  return buildEmailShell(`
    <h2 style="margin:0 0 8px;font-size:18px;font-weight:700;color:#111827;">
      Confirm your email address
    </h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
      Hi <strong>${firstName}</strong>, thanks for signing up for Orbit Analytics!<br/>
      Enter the code below to verify your email and activate your account.
      It expires in <strong>15 minutes</strong>.
    </p>
    ${buildCodeBox(code, "Email verification code")}
    <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
      If you didn't create an Orbit account, you can safely ignore this email.
    </p>
  `);
}

// ── Email: password reset ─────────────────────────────────────
function buildResetHtml(code: string): string {
  return buildEmailShell(`
    <h2 style="margin:0 0 8px;font-size:18px;font-weight:700;color:#111827;">
      Reset your password
    </h2>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
      We received a request to reset the password for your Orbit account.
      Use the code below — it expires in <strong>15 minutes</strong>.
    </p>
    ${buildCodeBox(code, "Password reset code")}
    <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
      If you didn't request a password reset, you can safely ignore this email —
      your password will not be changed.
    </p>
  `);
}

// ── Core send helper ──────────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string, text: string): Promise<boolean> {
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const from   = process.env.RESEND_FROM_EMAIL ?? "Orbit Analytics <onboarding@resend.dev>";
      const result = await resend.emails.send({ from, to, subject, html, text });
      if (result.error) { console.error("[mailer] Resend error:", result.error); return false; }
      return true;
    } catch (err) {
      console.error("[mailer] Resend failed:", err);
      return false;
    }
  }
  return false; // no provider — caller logs to console
}

// ── Public API ────────────────────────────────────────────────

/** Signup email verification */
export async function sendVerificationEmail(to: string, name: string, code: string): Promise<boolean> {
  return sendEmail(
    to,
    "Confirm your Orbit account — verification code",
    buildVerificationHtml(name, code),
    `Hi ${name},\n\nYour Orbit email verification code is: ${code}\n\nIt expires in 15 minutes.\n\nIf you didn't sign up, ignore this email.`
  );
}

/** Password reset */
export async function sendResetEmail(to: string, code: string): Promise<boolean> {
  return sendEmail(
    to,
    "Your Orbit password reset code",
    buildResetHtml(code),
    `Your Orbit password reset code is: ${code}\n\nThis code expires in 15 minutes.`
  );
}
