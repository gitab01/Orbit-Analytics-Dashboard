import { NextRequest, NextResponse } from "next/server";

// Minimal middleware — only protect the dashboard root.
// Auth is also enforced client-side in page.tsx as a fallback.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip: login, signup, api routes, Next.js internals, static files
  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const session = req.cookies.get("orbit_session")?.value;
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.svg).*)"],
};
