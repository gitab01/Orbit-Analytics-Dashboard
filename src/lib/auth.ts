import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "orbit-dev-secret-change-in-production"
);

const COOKIE = "orbit_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionUser {
  id:    string;
  name:  string;
  email: string;
  role:  string;
}

/** Create a signed JWT and return the token string */
export async function createToken(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

/** Verify a JWT token and return the payload, or null if invalid */
export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

/** Read + verify the session cookie from the current request */
export async function getSession(): Promise<SessionUser | null> {
  try {
    // next/headers cookies() — works in Route Handlers and Server Components
    const { cookies } = await import("next/headers");
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export { COOKIE, MAX_AGE };
