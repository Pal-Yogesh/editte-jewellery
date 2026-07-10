import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import {
  VENDOR_COLLECTION,
  getVendorByEmail,
  getVendorCookieName,
  signVendorToken,
} from "@/lib/auth/vendor";
import { verifyOtp } from "@/lib/vendor/otp";
import type { OtpPurpose } from "@/lib/vendor/types";

type VerifyBody = {
  email?: string;
  otp?: string;
  purpose?: OtpPurpose;
};

export async function POST(request: Request) {
  let body: VerifyBody;
  try {
    body = (await request.json()) as VerifyBody;
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const otp = body.otp?.trim();
  const purpose: OtpPurpose = body.purpose === "signup" ? "signup" : "login";

  if (!email || !otp) {
    return NextResponse.json(
      { message: "Email and code are required." },
      { status: 400 }
    );
  }

  const vendor = await getVendorByEmail(email);
  if (!vendor) {
    return NextResponse.json({ message: "Invalid request." }, { status: 401 });
  }

  const result = await verifyOtp(vendor.vendorId, otp, purpose);
  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: result.status });
  }

  // Mark email verified on signup verification.
  if (purpose === "signup" && !vendor.emailVerified) {
    await db.collection(VENDOR_COLLECTION).doc(vendor.vendorId).update({
      emailVerified: true,
      updatedAt: new Date().toISOString(),
    });
  }

  const token = signVendorToken(vendor.vendorId, vendor.email);
  const response = NextResponse.json(
    { message: "Verified successfully.", authenticated: true, role: "vendor" },
    { status: 200 }
  );

  response.cookies.set({
    name: getVendorCookieName(),
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}
