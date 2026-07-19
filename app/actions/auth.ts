"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { createSession, deleteSession } from "@/lib/session";
import { sendOtp, verifyOtp } from "@/lib/otp";

// ─── Schemas ──────────────────────────────────────────────────────────────────
const LoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const SignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

const OtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "Enter the 6-digit code"),
  purpose: z.enum(["verify", "reset"]),
});

export type ActionState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
  redirect?: string;
} | undefined;

// ─── Sign Up ──────────────────────────────────────────────────────────────────
export async function signupAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = SignupSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, password } = parsed.data;

  try {
    // Check if user already exists
    try {
      await adminAuth.getUserByEmail(email);
      return { errors: { email: ["An account with this email already exists."] } };
    } catch {
      // user not found — good
    }

    // Create Firebase Auth user
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
      emailVerified: false,
    });

    // Create Firestore user doc
    await adminDb.collection("users").doc(userRecord.uid).set({
      name,
      email,
      photoURL: null,
      phone: null,
      dob: null,
      gender: null,
      createdAt: Date.now(),
    });

    // Send OTP for email verification
    const { success, error } = await sendOtp(email, "verify");
    if (!success) return { message: error ?? "Failed to send verification email." };

    return { success: true, redirect: `/auth/verify-otp?email=${encodeURIComponent(email)}&purpose=verify` };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return { message };
  }
}

// ─── Login ────────────────────────────────────────────────────────────────────
export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data;

  try {
    // Use Firebase REST API to verify password (Admin SDK doesn't verify passwords)
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!;
    if (!apiKey || apiKey === "your_api_key_here") {
      return { message: "Firebase API key is not configured. Please add NEXT_PUBLIC_FIREBASE_API_KEY to your .env file." };
    }

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
        code.includes("INVALID_LOGIN_CREDENTIALS") ||
        code.includes("INVALID_EMAIL")
      ) {
        return { errors: { email: ["Incorrect email or password."] } };
      }
      if (code.includes("TOO_MANY_ATTEMPTS")) {
        return { message: "Too many failed attempts. Please try again later." };
      }
      console.error("Firebase login error:", code);
      return { message: "Login failed. Please try again." };
    }

    const { localId, email: userEmail } = await res.json();

    // Check email verified
    const user = await adminAuth.getUser(localId);
    if (!user.emailVerified) {
      await sendOtp(email, "verify");
      return {
        success: false,
        redirect: `/auth/verify-otp?email=${encodeURIComponent(email)}&purpose=verify`,
        message: "Please verify your email. A new code has been sent.",
      };
    }

    await createSession({ uid: localId, email: userEmail, emailVerified: true, expiresAt: 0 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    console.error("loginAction error:", message);
    return { message };
  }

  redirect("/dashboard");
}

// ─── Verify OTP ───────────────────────────────────────────────────────────────
export async function verifyOtpAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    email: formData.get("email") as string,
    otp: formData.get("otp") as string,
    purpose: formData.get("purpose") as string,
  };

  const parsed = OtpSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { email, otp, purpose } = parsed.data;
  const result = await verifyOtp(email, otp, purpose);

  if (!result.success) return { message: result.error };

  if (purpose === "verify") {
    // Mark email as verified in Firebase Auth
    const user = await adminAuth.getUserByEmail(email);
    await adminAuth.updateUser(user.uid, { emailVerified: true });
    await createSession({ uid: user.uid, email, emailVerified: true, expiresAt: 0 });
    redirect("/dashboard");
  }

  // purpose === "reset" — redirect to reset password page
  return { success: true, redirect: `/auth/reset-password?email=${encodeURIComponent(email)}` };
}

// ─── Resend OTP ───────────────────────────────────────────────────────────────
export async function resendOtpAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get("email") as string;
  const purpose = formData.get("purpose") as "verify" | "reset";
  if (!email) return { message: "Email is required." };

  const { success, error } = await sendOtp(email, purpose);
  if (!success) return { message: error ?? "Failed to send OTP." };
  return { success: true, message: "A new code has been sent to your email." };
}

// ─── Forgot Password ──────────────────────────────────────────────────────────
export async function forgotPasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get("email") as string;
  if (!z.string().email().safeParse(email).success) {
    return { errors: { email: ["Enter a valid email address."] } };
  }

  try {
    await adminAuth.getUserByEmail(email);
  } catch {
    // Don't reveal whether email exists
    return { success: true, message: "If that email is registered, a code has been sent." };
  }

  const { success, error } = await sendOtp(email, "reset");
  if (!success) return { message: error ?? "Failed to send reset email." };

  return {
    success: true,
    redirect: `/auth/verify-otp?email=${encodeURIComponent(email)}&purpose=reset`,
  };
}

// ─── Reset Password ───────────────────────────────────────────────────────────
const ResetSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

export async function resetPasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = ResetSchema.safeParse(raw);
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  try {
    const userRecord = await adminAuth.getUserByEmail(parsed.data.email);
    await adminAuth.updateUser(userRecord.uid, { password: parsed.data.password });
    // Password updated — redirect to login with success indicator
    return { success: true, redirect: "/auth/login?reset=1" };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("resetPasswordAction error:", msg);
    return { message: "Could not reset password. Please request a new reset code and try again." };
  }
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export async function logoutAction() {
  await deleteSession();
  redirect("/auth/login");
}
