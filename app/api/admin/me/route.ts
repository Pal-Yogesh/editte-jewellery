import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminCookieName, verifyAdminToken } from "@/lib/auth/admin";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;

  if (!token) {
    return NextResponse.json(
      { authenticated: false, message: "Not authenticated." },
      { status: 401 }
    );
  }

  const payload = verifyAdminToken(token);

  if (!payload) {
    return NextResponse.json(
      { authenticated: false, message: "Invalid or expired session." },
      { status: 401 }
    );
  }

  return NextResponse.json(
    {
      authenticated: true,
      role: "admin",
      adminId: payload.adminId,
    },
    { status: 200 }
  );
}
