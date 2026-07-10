import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import { db } from "@/lib/firebase-admin";
import {
  getAdminFromDb,
  verifyAdminPassword,
} from "@/lib/auth/admin";
import { sendOtpEmail } from "@/lib/resend";

const OTP_COLLECTION = "admin_otp";
const OTP_EXPIRY_SECONDS = 60;
const OTP_COOLDOWN_SECONDS = 60;

type LoginBody = {
  adminId?: string;
  password?: string;
};

function generateOtp(): string {
  return randomInt(100000, 999999).toString();
}

export async function POST(request: Request) {
  let body: LoginBody;

  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 }
    );
  }

  const adminIdInput = body.adminId?.trim();
  const passwordInput = body.password;

  if (!adminIdInput || !passwordInput) {
    return NextResponse.json(
      { message: "adminId and password are required." },
      { status: 400 }
    );
  }

  const admin = await getAdminFromDb(adminIdInput);

  if (!admin) {
    return NextResponse.json(
      { message: "Invalid credentials." },
      { status: 401 }
    );
  }

  const isPasswordValid = await verifyAdminPassword(
    passwordInput,
    admin.passwordHash
  );

  if (!isPasswordValid) {
    return NextResponse.json(
      { message: "Invalid credentials." },
      { status: 401 }
    );
  }

  // Check cooldown — prevent OTP spam
  const existingOtp = await db.collection(OTP_COLLECTION).doc(adminIdInput).get();
  if (existingOtp.exists) {
    const createdAt = new Date(existingOtp.data()!.createdAt as string);
    const secondsSince = (Date.now() - createdAt.getTime()) / 1000;
    if (secondsSince < OTP_COOLDOWN_SECONDS) {
      return NextResponse.json(
        { message: "OTP already sent. Please wait before requesting again." },
        { status: 429 }
      );
    }
  }

  // Fetch email from DB (never exposed to client)
  if (!admin.email) {
    return NextResponse.json(
      { message: "Admin account not configured for OTP." },
      { status: 500 }
    );
  }

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_SECONDS * 1000).toISOString();

  await db.collection(OTP_COLLECTION).doc(adminIdInput).set({
    otp,
    expiresAt,
    attempts: 0,
    used: false,
    createdAt: new Date().toISOString(),
  });

  try {
    await sendOtpEmail(admin.email, otp);
  } catch {
    await db.collection(OTP_COLLECTION).doc(adminIdInput).delete();
    return NextResponse.json(
      { message: "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "OTP sent to your registered email.", otpRequired: true },
    { status: 200 }
  );
}
