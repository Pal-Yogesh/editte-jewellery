import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import {
  VENDOR_COLLECTION,
  getVendorByEmail,
  hashPassword,
} from "@/lib/auth/vendor";
import { createOtp } from "@/lib/vendor/otp";
import { sendVendorOtpEmail } from "@/lib/resend";
import {
  createEmptyBankDetails,
  createEmptyPickupAddress,
  createEmptyVendorKyc,
  createEmptyVendorProfile,
} from "@/lib/vendor/types";

type SignupBody = {
  email?: string;
  password?: string;
  brandName?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: SignupBody;
  try {
    body = (await request.json()) as SignupBody;
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  const brandName = body.brandName?.trim() ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required." },
      { status: 400 }
    );
  }
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ message: "Invalid email address." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { message: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const existing = await getVendorByEmail(email);
  if (existing) {
    return NextResponse.json(
      { message: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();

  const ref = db.collection(VENDOR_COLLECTION).doc();
  await ref.set({
    email,
    passwordHash,
    emailVerified: false,
    status: "incomplete",
    rejectionReason: null,
    profile: { ...createEmptyVendorProfile(), brandName },
    kyc: createEmptyVendorKyc(),
    bankDetails: createEmptyBankDetails(),
    pickupAddress: createEmptyPickupAddress(),
    commission: { accepted: false, acceptedAt: null },
    createdAt: now,
    updatedAt: now,
    approvedAt: null,
    approvedBy: null,
  });

  const otpResult = await createOtp(ref.id, "signup");
  if (!otpResult.ok) {
    return NextResponse.json({ message: otpResult.message }, { status: otpResult.status });
  }

  try {
    await sendVendorOtpEmail(email, otpResult.otp, "signup");
  } catch {
    return NextResponse.json(
      { message: "Failed to send verification email. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      message: "Verification code sent to your email.",
      verificationRequired: true,
      purpose: "signup",
    },
    { status: 201 }
  );
}
