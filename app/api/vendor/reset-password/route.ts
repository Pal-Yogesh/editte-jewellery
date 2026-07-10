import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import {
  VENDOR_COLLECTION,
  getVendorByEmail,
  hashPassword,
} from "@/lib/auth/vendor";
import { verifyOtp } from "@/lib/vendor/otp";

type ResetBody = {
  email?: string;
  otp?: string;
  password?: string;
};

export async function POST(request: Request) {
  let body: ResetBody;
  try {
    body = (await request.json()) as ResetBody;
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const otp = body.otp?.trim();
  const password = body.password;

  if (!email || !otp || !password) {
    return NextResponse.json(
      { message: "Email, code, and new password are required." },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { message: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const vendor = await getVendorByEmail(email);
  if (!vendor) {
    return NextResponse.json({ message: "Invalid request." }, { status: 401 });
  }

  const result = await verifyOtp(vendor.vendorId, otp, "reset");
  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: result.status });
  }

  const passwordHash = await hashPassword(password);
  await db.collection(VENDOR_COLLECTION).doc(vendor.vendorId).update({
    passwordHash,
    emailVerified: true,
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json(
    { message: "Password updated. You can now log in." },
    { status: 200 }
  );
}
