import { NextRequest, NextResponse } from "next/server";

// Runs on Edge Runtime — Buffer is NOT available, use atob/btoa only.

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Pass through: public pages, API auth routes, Next.js internals
  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/_next/")
  ) {
    return NextResponse.next();
  }

  const session = req.cookies.get("orbit_session")?.value;

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  try {
    JSON.parse(atob(session));
    return NextResponse.next();
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static (static files)
     * - _next/image  (image optimization)
     * - favicon.svg  (favicon)
     * - files with an extension (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.svg).*)",
  ],
};
