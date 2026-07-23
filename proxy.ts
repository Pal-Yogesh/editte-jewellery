import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getAdminSlug } from "@/lib/admin-slug";

const ADMIN_COOKIE_NAME = "admin_token";
const VENDOR_COOKIE_NAME = "vendor_token";

async function verifyRole(
  token: string,
  role: "admin" | "vendor"
): Promise<boolean> {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) return false;

  try {
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secret);
    return payload.role === role;
  } catch {
    return false;
  }
}

async function handleAdmin(
  request: NextRequest,
  slug: string
): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === `/${slug}/login`;
  const isExact = pathname === `/${slug}`;

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const isAuthenticated = token ? await verifyRole(token, "admin") : false;

  if (isExact) {
    const target = isAuthenticated ? `/${slug}/dashboard` : `/${slug}/login`;
    return NextResponse.redirect(new URL(target, request.url));
  }
  if (isLogin && isAuthenticated) {
    return NextResponse.redirect(new URL(`/${slug}/dashboard`, request.url));
  }
  if (!isLogin && !isAuthenticated) {
    return NextResponse.redirect(new URL(`/${slug}/login`, request.url));
  }
  return NextResponse.next();
}

async function handleVendor(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const publicRoutes = [
    "/vendor/login",
    "/vendor/signup",
    "/vendor/forgot-password",
  ];
  const isPublic = publicRoutes.includes(pathname);
  const isExact = pathname === "/vendor";

  const token = request.cookies.get(VENDOR_COOKIE_NAME)?.value;
  const isAuthenticated = token ? await verifyRole(token, "vendor") : false;

  if (isExact) {
    const target = isAuthenticated ? "/vendor/dashboard" : "/vendor/login";
    return NextResponse.redirect(new URL(target, request.url));
  }
  if (isPublic && isAuthenticated) {
    return NextResponse.redirect(new URL("/vendor/dashboard", request.url));
  }
  if (!isPublic && !isAuthenticated) {
    return NextResponse.redirect(new URL("/vendor/login", request.url));
  }
  return NextResponse.next();
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/vendor")) {
    return handleVendor(request);
  }

  // Admin lives under a secret, env-configured slug.
  const slug = getAdminSlug();
  if (
    pathname === `/${slug}` ||
    pathname === `/${slug}/login` ||
    pathname === `/${slug}/dashboard`
  ) {
    return handleAdmin(request, slug);
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except Next internals and API routes; the proxy body
  // decides what (if anything) to gate.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
