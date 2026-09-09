// ── Shared validation helpers ─────────────────────────────────

/**
 * General email regex — used for login and API validation.
 * Accepts any valid email format.
 */
export const EMAIL_RE_GENERAL =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

/**
 * Gmail-only regex — used for signup to enforce @gmail.com.
 */
export const EMAIL_RE =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9.]{0,28}[a-zA-Z0-9])?@gmail\.com$/;

export const COMMON_DOMAINS = ["gmail.com"];

/** Used by login API — accepts any valid email */
export function isValidEmail(email: string): boolean {
  return EMAIL_RE_GENERAL.test(email.trim().toLowerCase());
}

/** Used by signup — only accepts @gmail.com */
export function isValidGmailEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim().toLowerCase());
}

/** Returns an error string if invalid, null if valid (signup — gmail only) */
export function validateEmailField(email: string): string | null {
  const e = email.trim();
  if (!e) return "Email address is required";
  if (!e.includes("@")) return "Please include '@' in the email address";
  const [, domain] = e.split("@");
  if (!domain) return "Email must be in the format name@gmail.com";
  if (domain.toLowerCase() !== "gmail.com")
    return "Only Gmail addresses are accepted (e.g. name@gmail.com)";
  if (!EMAIL_RE.test(e.toLowerCase()))
    return "Please enter a valid Gmail address (e.g. name@gmail.com)";
  return null;
}

/** Returns an error string if invalid, null if valid (login — any email) */
export function validateLoginEmail(email: string): string | null {
  const e = email.trim();
  if (!e) return "Email address is required";
  if (!e.includes("@")) return "Please include '@' in the email address";
  if (!EMAIL_RE_GENERAL.test(e.toLowerCase()))
    return "Please enter a valid email address";
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
