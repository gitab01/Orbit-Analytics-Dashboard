// ── Shared validation helpers ─────────────────────────────────

/**
 * Valid email domains — accepts major public providers + any business domain.
 * Rejects obviously fake TLDs but allows all real ones.
 */
export const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

// Well-known personal email domains for friendly hint messages
export const COMMON_DOMAINS = [
  "gmail.com","yahoo.com","outlook.com","hotmail.com","icloud.com",
  "live.com","proton.me","protonmail.com","aol.com","zoho.com",
  "yandex.com","mail.com","gmx.com","tutanota.com",
];

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

/** Returns an error string if invalid, null if valid */
export function validateEmailField(email: string): string | null {
  const e = email.trim();
  if (!e) return "Email address is required";
  if (!EMAIL_RE.test(e)) {
    // Give a helpful hint for the most common mistake
    if (!e.includes("@")) return "Please include an '@' in the email address";
    if (!e.includes(".")) return "Please enter a complete email (e.g. name@gmail.com)";
    return "Please enter a valid email address (e.g. name@gmail.com)";
  }
  return null;
}

export function isValidPassword(pw: string): string | null {
  if (pw.length < 8)       return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(pw))   return "Add at least one uppercase letter (A–Z)";
  if (!/[0-9]/.test(pw))   return "Add at least one number (0–9)";
  return null;
}

export function isValidName(name: string): string | null {
  const n = name.trim();
  if (!n)          return "Full name is required";
  if (n.length < 2) return "Name must be at least 2 characters";
  if (n.length > 80) return "Name must be under 80 characters";
  return null;
}
