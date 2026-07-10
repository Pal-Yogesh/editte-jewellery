import { randomInt } from "crypto";
import { db } from "@/lib/firebase-admin";
import type { OtpPurpose } from "@/lib/vendor/types";

export const VENDOR_OTP_COLLECTION = "vendor_otp";
const OTP_EXPIRY_SECONDS = 300; // 5 minutes
const OTP_COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS = 5;

function generateOtp(): string {
  return randomInt(100000, 999999).toString();
}

export type CreateOtpResult =
  | { ok: true; otp: string }
  | { ok: false; status: number; message: string };

/**
 * Creates (or refreshes) an OTP for a vendor + purpose, enforcing a cooldown to
 * prevent spamming. Returns the plaintext OTP so the caller can email it.
 */
export async function createOtp(
  vendorId: string,
  purpose: OtpPurpose
): Promise<CreateOtpResult> {
  const ref = db.collection(VENDOR_OTP_COLLECTION).doc(vendorId);
  const existing = await ref.get();

  if (existing.exists) {
    const data = existing.data()!;
    const createdAt = new Date(data.createdAt as string);
    const secondsSince = (Date.now() - createdAt.getTime()) / 1000;
    if (secondsSince < OTP_COOLDOWN_SECONDS) {
      return {
        ok: false,
        status: 429,
        message: "A code was recently sent. Please wait a moment and try again.",
      };
    }
  }

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_SECONDS * 1000).toISOString();

  await ref.set({
    otp,
    purpose,
    expiresAt,
    attempts: 0,
    used: false,
    createdAt: new Date().toISOString(),
  });

  return { ok: true, otp };
}

export type VerifyOtpResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

/**
 * Validates an OTP for a vendor + purpose. On success the OTP is marked used.
 */
export async function verifyOtp(
  vendorId: string,
  otp: string,
  purpose: OtpPurpose
): Promise<VerifyOtpResult> {
  const ref = db.collection(VENDOR_OTP_COLLECTION).doc(vendorId);
  const doc = await ref.get();

  if (!doc.exists) {
    return { ok: false, status: 401, message: "No code found. Please request a new one." };
  }

  const data = doc.data()!;
  const expiresAt = new Date(data.expiresAt as string);
  const attempts = (data.attempts as number) || 0;

  if (data.used === true) {
    return { ok: false, status: 401, message: "Code already used. Please request a new one." };
  }

  if (data.purpose !== purpose) {
    return { ok: false, status: 401, message: "Invalid code. Please request a new one." };
  }

  if (attempts >= MAX_ATTEMPTS) {
    await ref.update({ used: true });
    return { ok: false, status: 429, message: "Too many attempts. Please request a new code." };
  }

  if (new Date() > expiresAt) {
    return { ok: false, status: 401, message: "Code expired. Please request a new one." };
  }

  if (data.otp !== otp) {
    await ref.update({ attempts: attempts + 1 });
    return { ok: false, status: 401, message: "Invalid code." };
  }

  await ref.update({ used: true });
  return { ok: true };
}
