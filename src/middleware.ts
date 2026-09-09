import { NextRequest, NextResponse } from "next/server";

// NOTE: This middleware runs on the Edge Runtime — Buffer is NOT available.
// Use atob/btoa (Web APIs) instead.

const PUBLIC_PATHS = ["/login", "/signup"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public auth paths, Next internals, and static files
  if (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const session = req.cookies.get("orbit_session")?.value;

  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Edge-safe base64 decode — atob is available in Edge Runtime
    const decoded = atob(session);
    JSON.parse(decoded);
    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  // Match everything except Next.js internals and static assets
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.svg|.*\\.(?:ico|png|jpg|jpeg|svg|webp|css|js|woff2?|ttf)).*)",
  ],
};
