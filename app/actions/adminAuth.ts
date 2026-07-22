"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { createSession, deleteSession } from "@/lib/session";
import { resend, FROM } from "@/lib/resend";
import crypto from "crypto";

export type ActionState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
  redirect?: string;
} | undefined;

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS  = 5;

function hashOtp(otp: string) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

// ─── Step 1: Admin login — verify credentials, send 2FA OTP ──────────────────
export async function adminLoginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email    = (formData.get("email")    as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { errors: { email: ["Email and password are required."] } };
  }

  // 1. Verify password via Firebase REST API
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!;
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const code = (err?.error?.message ?? "") as string;
    if (
      code.includes("INVALID_PASSWORD") ||
      code.includes("EMAIL_NOT_FOUND") ||
      code.includes("INVALID_LOGIN_CREDENTIALS")
    ) {
      return { errors: { email: ["Incorrect email or password."] } };
    }
    if (code.includes("TOO_MANY_ATTEMPTS")) {
      return { message: "Too many attempts. Please try again later." };
    }
    return { message: "Login failed. Please try again." };
  }

  const { localId } = await res.json();

  // 2. Check role — if no admin exists yet, bootstrap this account as first admin
  const snap = await adminDb.collection("users").doc(localId).get();
  const existingRole = snap.data()?.role as string | undefined;

  let role = existingRole;

  if (!role) {
    // No role set yet — check if any admin exists in the system
    const adminSnap = await adminDb
      .collection("users")
      .where("role", "==", "admin")
      .limit(1)
      .get();

    if (adminSnap.empty) {
      // First admin bootstrap — grant admin role and create/update user doc
      await adminDb.collection("users").doc(localId).set({
        email,
        name: "Admin",
        role: "admin",
        photoURL: null,
        createdAt: Date.now(),
      }, { merge: true });
      console.log(`[adminAuth] First admin bootstrapped: ${email}`);
      role = "admin";
    } else {
      role = "customer";
    }
  }

  if (role !== "admin") {
    return { errors: { email: ["This account does not have admin access."] } };
  }

  // 3. Generate + store hashed OTP
  const otp     = String(crypto.randomInt(100000, 999999));
  const hashed  = hashOtp(otp);
  const expires = Date.now() + OTP_EXPIRY_MS;

  await adminDb.collection("adminOtps").doc(email).set({
    hash: hashed,
    uid: localId,
    expiresAt: expires,
    attempts: 0,
    createdAt: Date.now(),
  });

  // 4. Send OTP email
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "editte Admin — 2FA verification code",
    html: `
      <div style="font-family:'Goudy Old Style',Georgia,serif;max-width:480px;margin:0 auto;padding:40px 24px;background:#f9f5f1;color:#361515;">
        <h1 style="font-size:24px;margin:0 0 4px;">editte Admin</h1>
        <p style="font-size:13px;color:#888;margin:0 0 28px;">Two-factor authentication</p>
        <p style="font-size:15px;margin:0 0 20px;">Your 2FA code — expires in 10 minutes:</p>
        <div style="background:#361515;color:#f9f5f1;font-size:34px;font-weight:700;letter-spacing:0.35em;text-align:center;padding:20px;border-radius:8px;margin:0 0 24px;">${otp}</div>
        <p style="font-size:13px;color:#888;">Never share this code. If you didn't request it, your password may be compromised.</p>
      </div>`,
  });

  return {
    success: true,
    redirect: `/admin/verify-2fa?email=${encodeURIComponent(email)}`,
  };
}

// ─── Step 2: Verify 2FA OTP — issue admin session ────────────────────────────
export async function adminVerify2FAAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const otp   = (formData.get("otp")   as string)?.trim();

  if (!email || !otp || otp.length !== 6) {
    return { errors: { otp: ["Enter the 6-digit code."] } };
  }

  const ref  = adminDb.collection("adminOtps").doc(email);
  const snap = await ref.get();

  if (!snap.exists) {
    return { message: "No OTP found. Please go back and log in again." };
  }

  const data = snap.data()!;

  if (data.attempts >= MAX_ATTEMPTS) {
    await ref.delete();
    return { message: "Too many failed attempts. Please log in again." };
  }

  if (Date.now() > data.expiresAt) {
    await ref.delete();
    return { message: "Code expired. Please log in again." };
  }

  if (hashOtp(otp) !== data.hash) {
    await ref.update({ attempts: data.attempts + 1 });
    const remaining = MAX_ATTEMPTS - data.attempts - 1;
    return {
      message: `Incorrect code. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`,
    };
  }

  // Valid — delete OTP record
  await ref.delete();

  // Issue admin session
  const uid      = data.uid as string;
  const userSnap = await adminDb.collection("users").doc(uid).get();
  const userEmail = userSnap.data()?.email ?? email;

  await createSession({
    uid,
    email: userEmail,
    emailVerified: true,
    role: "admin",
    expiresAt: 0,
  });

  redirect("/admin");
}

// ─── Resend admin 2FA OTP ─────────────────────────────────────────────────────
export async function adminResend2FAAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email) return { message: "Email is required." };

  // Verify this email has a pending admin OTP session
  const snap = await adminDb.collection("adminOtps").doc(email).get();
  if (!snap.exists) {
    return { message: "Session expired. Please log in again.", redirect: "/admin/login" };
  }

  const otp    = String(crypto.randomInt(100000, 999999));
  const hashed = hashOtp(otp);

  await adminDb.collection("adminOtps").doc(email).set({
    ...snap.data(),
    hash: hashed,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    attempts: 0,
    createdAt: Date.now(),
  });

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "editte Admin — New 2FA code",
    html: `
      <div style="font-family:'Goudy Old Style',Georgia,serif;max-width:480px;margin:0 auto;padding:40px 24px;background:#f9f5f1;color:#361515;">
        <h1 style="font-size:24px;margin:0 0 4px;">editte Admin</h1>
        <p style="font-size:15px;margin:0 0 20px;">Your new 2FA code:</p>
        <div style="background:#361515;color:#f9f5f1;font-size:34px;font-weight:700;letter-spacing:0.35em;text-align:center;padding:20px;border-radius:8px;">${otp}</div>
      </div>`,
  });

  return { success: true, message: "A new code has been sent." };
}

// ─── Admin logout ────────────────────────────────────────────────────────────
export async function adminLogoutAction() {
  await deleteSession();
  redirect("/admin/login");
}
