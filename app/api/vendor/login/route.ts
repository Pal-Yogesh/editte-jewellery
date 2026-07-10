import { NextResponse } from "next/server";
import { getVendorByEmail, verifyVendorPassword } from "@/lib/auth/vendor";
import { createOtp } from "@/lib/vendor/otp";
import { sendVendorOtpEmail } from "@/lib/resend";
import type { OtpPurpose } from "@/lib/vendor/types";

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required." },
      { status: 400 }
    );
  }

  const vendor = await getVendorByEmail(email);
  if (!vendor) {
    return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
  }

  const isValid = await verifyVendorPassword(password, vendor.passwordHash);
  if (!isValid) {
    return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
  }

  // If the email was never verified, resume the signup verification flow.
  const purpose: OtpPurpose = vendor.emailVerified ? "login" : "signup";

  const otpResult = await createOtp(vendor.vendorId, purpose);
  if (!otpResult.ok) {
    return NextResponse.json({ message: otpResult.message }, { status: otpResult.status });
  }

  try {
    await sendVendorOtpEmail(email, otpResult.otp, purpose);
  } catch {
    return NextResponse.json(
      { message: "Failed to send verification code. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      message:
        purpose === "signup"
          ? "Please verify your email. A code has been sent."
          : "A verification code has been sent to your email.",
      otpRequired: true,
      purpose,
    },
    { status: 200 }
  );
}
