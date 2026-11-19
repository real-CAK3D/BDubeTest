import { NextResponse, type NextRequest } from "next/server";
import { getSession, touchSession } from "./lib/admin-security";
import { SESSION_COOKIE, verifySessionToken } from "./lib/auth";

// Guards the dashboard. Runs on Node.js so it can check the list of signed-in
// devices: a device signed out from Settings > Security is out straight away.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login" || pathname === "/admin/forgot" || pathname === "/admin/reset") return NextResponse.next();
  const sid = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  const ok = sid ? await touchSession(sid).catch(() => false) : false;
  // signed in with the starter password: nothing but "choose your password" until they do
  if (ok && (await getSession(sid!).catch(() => null))?.pending) {
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Choose your own password first." }, { status: 403 });
    if (pathname !== "/admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }
  if (ok) {
    const res = NextResponse.next();
    res.headers.set("x-frame-options", "DENY");
    res.headers.set("cache-control", "private, no-store");
    return res;
  }
  if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = pathname === "/admin" ? "" : `?next=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(url);
}

export const config = { runtime: "nodejs", matcher: ["/admin/:path*", "/api/admin/:path*"] };
