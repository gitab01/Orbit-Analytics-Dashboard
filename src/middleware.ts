import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/signup", "/api/auth/login", "/api/auth/signup"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths and static assets
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
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
    JSON.parse(Buffer.from(session, "base64").toString("utf-8"));
    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.svg).*)"],
};
