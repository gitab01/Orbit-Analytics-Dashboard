/**
 * In-memory OTP store for email verification during signup.
 * Separate from resetTokens so the two flows don't interfere.
 *
 * In production with multiple serverless instances, back this with Redis or a DB table.
 */

interface VerifyEntry {
  code:      string;   // 6-digit OTP
  name:      string;   // stored so the signup route can create the user after verification
  password:  string;   // bcrypt hash stored temporarily
  expiresAt: number;   // Unix ms
  attempts:  number;
}

const store = new Map<string, VerifyEntry>();

const TTL       = 15 * 60 * 1000; // 15 minutes
const MAX_TRIES = 5;

/** Store a pending registration and return the OTP code. */
export function createVerificationCode(
  email: string,
  name: string,
  passwordHash: string
): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  store.set(email.toLowerCase(), {
    code,
    name,
    password: passwordHash,
    expiresAt: Date.now() + TTL,
    attempts: 0,
  });
  return code;
}

export type VerifyEmailResult =
  | { status: "ok"; name: string; passwordHash: string }
  | { status: "invalid" | "expired" | "too_many_attempts" };

/** Verify the OTP. On success returns the stored name + hash so the caller can create the user. */
export function verifyEmailCode(email: string, code: string): VerifyEmailResult {
  const key   = email.toLowerCase();
  const entry = store.get(key);
  if (!entry) return { status: "invalid" };
  if (Date.now() > entry.expiresAt) { store.delete(key); return { status: "expired" }; }
  if (entry.attempts >= MAX_TRIES)  return { status: "too_many_attempts" };

  entry.attempts++;
  if (entry.code !== code.trim()) return { status: "invalid" };

  // Consume — remove so it can't be reused
  store.delete(key);
  return { status: "ok", name: entry.name, passwordHash: entry.password };
}

/** Returns true if there is a pending (unexpired) verification for this email. */
export function hasPendingVerification(email: string): boolean {
  const entry = store.get(email.toLowerCase());
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) { store.delete(email.toLowerCase()); return false; }
  return true;
}

/** Resend: replace the existing code with a new one, preserving name + hash. */
export function refreshVerificationCode(email: string): string | null {
  const entry = store.get(email.toLowerCase());
  if (!entry) return null;
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  store.set(email.toLowerCase(), {
    ...entry,
    code,
    expiresAt: Date.now() + TTL,
    attempts:  0,
  });
  return code;
}
