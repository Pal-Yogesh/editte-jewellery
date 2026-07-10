import { NextResponse } from "next/server";
import { getVendorCookieName } from "@/lib/auth/vendor";

export async function POST() {
  const response = NextResponse.json(
    { message: "Logout successful.", authenticated: false },
    { status: 200 }
  );

  response.cookies.set({
    name: getVendorCookieName(),
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
