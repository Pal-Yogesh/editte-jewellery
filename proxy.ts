import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session";

const CUSTOMER_PROTECTED = ["/dashboard"];
const ADMIN_PROTECTED    = ["/admin"];
const PUBLIC_AUTH        = ["/auth/login", "/auth/signup", "/auth/forgot-password"];
// Admin login pages are always public (not redirected even when logged in)
const ADMIN_AUTH         = ["/admin/login", "/admin/verify-2fa"];

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isCustomerProtected = CUSTOMER_PROTECTED.some((p) => pathname.startsWith(p));
  const isAdminProtected    = ADMIN_PROTECTED.some((p) => pathname.startsWith(p)) &&
                              !ADMIN_AUTH.some((p) => pathname.startsWith(p));
  const isPublicAuth        = PUBLIC_AUTH.some((p) => pathname.startsWith(p));
  const isAdminAuth         = ADMIN_AUTH.some((p) => pathname.startsWith(p));

  const token   = req.cookies.get("editte_session")?.value;
  const session = token ? await decrypt(token) : null;
  const isLoggedIn = !!session?.uid;
  const isAdmin    = isLoggedIn && session?.role === "admin";
  const isCustomer = isLoggedIn && session?.role === "customer";

  // ── Admin protected routes ────────────────────────────────────────────────
  if (isAdminProtected) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/admin/login", req.nextUrl));
    }
    if (!isAdmin) {
      // Logged in but not admin — redirect to customer dashboard
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
  }

  // ── Customer protected routes ────────────────────────────────────────────
  if (isCustomerProtected && !isLoggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // ── Redirect logged-in customers away from auth pages ────────────────────
  if (isPublicAuth && isCustomer) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  // ── Redirect logged-in admins away from admin auth pages ─────────────────
  if (isAdminAuth && isAdmin) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|css|js)$).*)",
  ],
};
