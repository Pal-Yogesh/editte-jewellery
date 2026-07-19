import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import { resend, FROM } from "@/lib/resend";
import * as crypto from "crypto";

const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;

function generateOtp(): string {
  return String(crypto.randomInt(100000, 999999));
}

function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export async function sendOtp(
  email: string,
  purpose: "verify" | "reset"
): Promise<{ success: boolean; error?: string }> {
  const otp = generateOtp();
  const hashed = hashOtp(otp);
  const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;

  // Store hashed OTP in Firestore
  await adminDb.collection("otps").doc(email).set({
    hash: hashed,
    purpose,
    expiresAt,
    attempts: 0,
    createdAt: Date.now(),
  });

  const subject =
    purpose === "verify"
      ? "Verify your editte account"
      : "Reset your editte password";

  const html = `
    <div style="font-family:'Goudy Old Style',Georgia,serif;max-width:480px;margin:0 auto;padding:40px 24px;background:#f9f5f1;color:#361515;">
      <h1 style="font-size:28px;font-weight:700;margin:0 0 8px;">editte</h1>
      <p style="font-size:14px;color:#666;margin:0 0 32px;">Fine Jewellery Collective</p>
      <h2 style="font-size:20px;font-weight:600;margin:0 0 16px;">${purpose === "verify" ? "Verify your email" : "Reset your password"}</h2>
      <p style="font-size:15px;margin:0 0 24px;">Use the code below. It expires in ${OTP_EXPIRY_MINUTES} minutes.</p>
      <div style="background:#361515;color:#f9f5f1;font-size:32px;font-weight:700;letter-spacing:0.3em;text-align:center;padding:20px;border-radius:8px;margin:0 0 24px;">${otp}</div>
      <p style="font-size:13px;color:#888;">If you didn't request this, you can ignore this email.</p>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject,
    html,
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function verifyOtp(
  email: string,
  otp: string,
  purpose: "verify" | "reset"
): Promise<{ success: boolean; error?: string }> {
  const ref = adminDb.collection("otps").doc(email);
  const snap = await ref.get();

  if (!snap.exists) return { success: false, error: "No OTP found. Please request a new one." };

  const data = snap.data()!;

  if (data.purpose !== purpose)
    return { success: false, error: "Invalid OTP type." };

  if (data.attempts >= MAX_ATTEMPTS) {
    await ref.delete();
    return { success: false, error: "Too many attempts. Please request a new OTP." };
  }

  if (Date.now() > data.expiresAt) {
    await ref.delete();
    return { success: false, error: "OTP has expired. Please request a new one." };
  }

  const hashed = hashOtp(otp);
  if (hashed !== data.hash) {
    await ref.update({ attempts: data.attempts + 1 });
    const remaining = MAX_ATTEMPTS - data.attempts - 1;
    return { success: false, error: `Incorrect code. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.` };
  }

  // Valid — delete OTP
  await ref.delete();
  return { success: true };
}
