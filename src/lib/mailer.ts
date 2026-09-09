/**
 * Mailer — sends the password-reset code email.
 *
 * Priority:
 *  1. Resend  — if RESEND_API_KEY is set
 *  2. Nodemailer via Gmail SMTP — if GMAIL_USER + GMAIL_APP_PASSWORD are set
 *  3. Console fallback (dev only)
 *
 * To use Gmail SMTP:
 *  - Enable 2-Step Verification on your Google account
 *  - Generate an App Password at https://myaccount.google.com/apppasswords
 *  - Add GMAIL_USER and GMAIL_APP_PASSWORD to .env.local
 */

function buildEmailHtml(code: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Inter,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;max-width:480px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#111827;padding:28px 32px;text-align:center;">
              <div style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;background:#15b382;border-radius:12px;margin-bottom:12px;">
                <span style="color:#ffffff;font-size:22px;font-weight:800;line-height:1;">O</span>
              </div>
              <h1 style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">
                Orbit Analytics
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 8px;font-size:18px;font-weight:700;color:#111827;">
                Reset your password
              </h2>
              <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
                We received a request to reset the password for your Orbit account.
                Use the code below — it expires in <strong>15 minutes</strong>.
              </p>

              <!-- Code box -->
              <div style="background:#f9fafb;border:2px dashed #a7f3d0;border-radius:12px;padding:28px 16px;text-align:center;margin-bottom:24px;">
                <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;">
                  Verification code
                </p>
                <p style="margin:0;font-size:42px;font-weight:800;letter-spacing:0.2em;color:#15b382;font-family:'Courier New',Courier,monospace;">
                  ${code}
                </p>
              </div>

              <p style="margin:0 0 8px;font-size:13px;color:#6b7280;line-height:1.6;">
                Enter this code on the password reset page. If you didn't request a
                password reset, you can safely ignore this email — your password
                will not be changed.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #f3f4f6;">
              <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
                © ${new Date().getFullYear()} Orbit Analytics. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Sends the reset code email.
 * Returns true if sent, false if no provider is configured (dev fallback).
 */
export async function sendResetEmail(to: string, code: string): Promise<boolean> {
  const html    = buildEmailHtml(code);
  const subject = "Your Orbit password reset code";
  const text    = `Your Orbit password reset code is: ${code}\n\nThis code expires in 15 minutes.`;

  // ── 1. Try Resend ────────────────────────────────────────────
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const from   = process.env.RESEND_FROM_EMAIL ?? "Orbit Analytics <noreply@orbit-analytics.app>";
      await resend.emails.send({ from, to, subject, html, text });
      return true;
    } catch (err) {
      console.error("[mailer] Resend failed:", err);
    }
  }

  // ── 2. Try Gmail SMTP via Nodemailer ─────────────────────────
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });
      await transporter.sendMail({
        from:    `"Orbit Analytics" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        text,
        html,
      });
      return true;
    } catch (err) {
      console.error("[mailer] Nodemailer/Gmail failed:", err);
    }
  }

  // ── 3. No provider — caller handles console fallback ─────────
  return false;
}
