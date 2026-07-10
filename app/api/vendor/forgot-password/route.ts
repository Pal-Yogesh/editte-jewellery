import { NextResponse } from "next/server";
import { getVendorByEmail } from "@/lib/auth/vendor";
import { createOtp } from "@/lib/vendor/otp";
import { sendVendorOtpEmail } from "@/lib/resend";

type ForgotBody = {
  email?: string;
};

const GENERIC_MESSAGE =
  "If an account exists for that email, a reset code has been sent.";

export async function POST(request: Request) {
  let body: ForgotBody;
  try {
    body = (await request.json()) as ForgotBody;
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ message: "Email is required." }, { status: 400 });
  }

  const vendor = await getVendorByEmail(email);

  // Always return a generic response so we don't reveal which emails are registered.
  if (!vendor) {
    return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
  }

  const otpResult = await createOtp(vendor.vendorId, "reset");
  if (!otpResult.ok) {
    // Still generic to the client, but surface rate-limit status.
    return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
  }

  try {
    await sendVendorOtpEmail(email, otpResult.otp, "reset");
  } catch {
    return NextResponse.json(
      { message: "Failed to send reset email. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
}
