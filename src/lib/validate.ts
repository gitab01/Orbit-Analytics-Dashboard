// ── Shared validation helpers ─────────────────────────────────

/** RFC-5321 compliant email regex — catches the most common mistakes */
export const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export function isValidPassword(pw: string): string | null {
  if (pw.length < 8)          return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(pw))      return "Password must contain at least one uppercase letter";
  if (!/[0-9]/.test(pw))      return "Password must contain at least one number";
  return null; // valid
}

export function isValidName(name: string): string | null {
  const n = name.trim();
  if (!n)         return "Full name is required";
  if (n.length < 2) return "Name must be at least 2 characters";
  if (n.length > 80) return "Name must be under 80 characters";
  return null;
}
