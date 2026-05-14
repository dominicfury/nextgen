import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth-cookie";

// Gates everything under /admin and /api/admin except the login routes.
//
// NOTE: the middleware can only check the *presence* of the session cookie
// — Edge runtime can't reach the SQLite DB. Page/route handlers re-verify
// via getCurrentAdmin() before serving sensitive content, which gives us
// the full security check; this middleware is just a fast-path redirect
// for unauthenticated users.

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/login/verify"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public admin paths pass through.
  if (PUBLIC_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  const session = req.cookies.get(SESSION_COOKIE)?.value;

  // No cookie → redirect (UI) or 401 (API).
  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 },
      );
    }
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
