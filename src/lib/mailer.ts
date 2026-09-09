/**
 * Mailer — sends the password-reset code email.
 *
 * Uses Resend (HTTP-based, works on Vercel serverless).
 * Nodemailer/SMTP does NOT work on Vercel — TCP connections are blocked.
 *
 * Setup:
 *  1. Sign up free at https://resend.com (100 emails/day free)
 *  2. Create an API key
 *  3. Add to Vercel env vars: RESEND_API_KEY
 *  4. For the sender address, use the Resend onboarding address for testing,
 *     or add + verify your own domain at resend.com/domains
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
 * Sends the reset code email via Resend (Vercel-compatible).
 * Returns true if sent, false if RESEND_API_KEY is not configured.
 */
export async function sendResetEmail(to: string, code: string): Promise<boolean> {
  const html    = buildEmailHtml(code);
  const subject = "Your Orbit password reset code";
  const text    = `Your Orbit password reset code is: ${code}\n\nThis code expires in 15 minutes.`;

  // ── Resend (HTTP — works on Vercel serverless) ───────────────
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      // Use verified sender domain, or Resend's onboarding address for testing
      const from = process.env.RESEND_FROM_EMAIL ?? "Orbit Analytics <onboarding@resend.dev>";

      const result = await resend.emails.send({ from, to, subject, html, text });

      if (result.error) {
        console.error("[mailer] Resend error:", result.error);
        return false;
      }
      return true;
    } catch (err) {
      console.error("[mailer] Resend failed:", err);
      return false;
    }
  }

  // ── No provider configured — console fallback (local dev only) ─
  return false;
}
