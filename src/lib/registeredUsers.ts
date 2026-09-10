/**
 * In-memory registered users store — used when DATABASE_URL is not set.
 *
 * Stores bcrypt-hashed passwords so login can verify credentials
 * for users who signed up via the email verification flow.
 *
 * NOTE: This is module-level state. On Vercel serverless, this persists
 * within a single warm instance but resets on cold starts. For true
 * persistence, set DATABASE_URL in your Vercel environment variables.
 */

export interface RegisteredUser {
  id:           string;
  name:         string;
  email:        string;
  passwordHash: string;
  role:         string;
}

// email (lowercase) → user
const users = new Map<string, RegisteredUser>();

export function addRegisteredUser(user: RegisteredUser): void {
  users.set(user.email.toLowerCase(), user);
}

export function findRegisteredUser(email: string): RegisteredUser | undefined {
  return users.get(email.toLowerCase());
}

export function hasRegisteredUser(email: string): boolean {
  return users.has(email.toLowerCase());
}
