import { NextResponse } from "next/server";
import { getAdminCookieName } from "@/lib/auth/admin";

export async function POST() {
  const response = NextResponse.json(
    { message: "Logout successful.", authenticated: false },
    { status: 200 }
  );

  response.cookies.set({
    name: getAdminCookieName(),
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
