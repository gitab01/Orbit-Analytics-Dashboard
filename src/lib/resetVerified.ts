/**
 * In-memory store for emails that have passed the reset-code verification step.
 * Kept here (outside route files) so it can be imported by both
 * verify-reset-code and reset-password routes without violating Next.js's
 * rule that route files may only export HTTP method handlers.
 *
 * NOTE: In production with multiple serverless instances, use a short-lived
 * signed token (JWT) or a Redis-backed store instead.
 */

const verifiedResets = new Set<string>();

export function markEmailVerified(email: string): void {
  const key = email.toLowerCase();
  verifiedResets.add(key);
  // Auto-expire after 10 minutes
  setTimeout(() => verifiedResets.delete(key), 10 * 60 * 1000);
}

export function isEmailVerified(email: string): boolean {
  return verifiedResets.has(email.toLowerCase());
}

export function clearEmailVerified(email: string): void {
  verifiedResets.delete(email.toLowerCase());
}
