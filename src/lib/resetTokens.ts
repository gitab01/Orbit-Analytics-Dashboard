/**
 * In-memory OTP store for password reset codes.
 * Works for both demo (no DB) and DB deployments.
 * In production with multiple instances you'd use Redis or a DB table.
 */

interface ResetEntry {
  code:      string;   // 6-digit OTP
  email:     string;
  expiresAt: number;   // Unix ms
  attempts:  number;
}

// email → entry
const store = new Map<string, ResetEntry>();

const TTL      = 15 * 60 * 1000; // 15 minutes
const MAX_TRIES = 5;

export function createResetCode(email: string): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  store.set(email.toLowerCase(), {
    code,
    email: email.toLowerCase(),
    expiresAt: Date.now() + TTL,
    attempts:  0,
  });
  return code;
}

export type VerifyResult = "ok" | "invalid" | "expired" | "too_many_attempts";

export function verifyResetCode(email: string, code: string): VerifyResult {
  const entry = store.get(email.toLowerCase());
  if (!entry) return "invalid";
  if (Date.now() > entry.expiresAt) { store.delete(email.toLowerCase()); return "expired"; }
  if (entry.attempts >= MAX_TRIES) return "too_many_attempts";

  entry.attempts++;
  if (entry.code !== code.trim()) return "invalid";

  // Mark as used (delete so it can't be reused)
  store.delete(email.toLowerCase());
  return "ok";
}
