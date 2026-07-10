import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import {
  getAdminCookieName,
  signAdminToken,
} from "@/lib/auth/admin";

const OTP_COLLECTION = "admin_otp";
const MAX_ATTEMPTS = 5;

type VerifyOtpBody = {
  adminId?: string;
  otp?: string;
};

export async function POST(request: Request) {
  let body: VerifyOtpBody;

  try {
    body = (await request.json()) as VerifyOtpBody;
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 }
    );
  }

  const adminId = body.adminId?.trim();
  const otp = body.otp?.trim();

  if (!adminId || !otp) {
    return NextResponse.json(
      { message: "adminId and otp are required." },
      { status: 400 }
    );
  }

  const otpDoc = await db.collection(OTP_COLLECTION).doc(adminId).get();

  if (!otpDoc.exists) {
    return NextResponse.json(
      { message: "No OTP found. Please login again." },
      { status: 401 }
    );
  }

  const otpData = otpDoc.data()!;
  const expiresAt = new Date(otpData.expiresAt as string);
  const attempts = (otpData.attempts as number) || 0;

  if (otpData.used === true) {
    return NextResponse.json(
      { message: "OTP already used. Please login again." },
      { status: 401 }
    );
  }

  if (attempts >= MAX_ATTEMPTS) {
    await db.collection(OTP_COLLECTION).doc(adminId).update({ used: true });
    return NextResponse.json(
      { message: "Too many attempts. Please login again." },
      { status: 429 }
    );
  }

  if (new Date() > expiresAt) {
    return NextResponse.json(
      { message: "OTP expired. Please login again." },
      { status: 401 }
    );
  }

  if (otpData.otp !== otp) {
    await db
      .collection(OTP_COLLECTION)
      .doc(adminId)
      .update({ attempts: attempts + 1 });

    return NextResponse.json(
      { message: "Invalid OTP." },
      { status: 401 }
    );
  }

  // OTP valid — mark as used (don't delete)
  await db.collection(OTP_COLLECTION).doc(adminId).update({ used: true });

  const token = signAdminToken(adminId);
  const response = NextResponse.json(
    { message: "Verified successfully.", authenticated: true, role: "admin" },
    { status: 200 }
  );

  response.cookies.set({
    name: getAdminCookieName(),
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}
