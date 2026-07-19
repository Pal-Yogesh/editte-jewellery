"use server";
import { z } from "zod";
import { adminAuth, adminDb, adminStorage } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/dal";
import { createSession } from "@/lib/session";
import type { ActionState } from "./auth";
import { revalidatePath } from "next/cache";

const ProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit phone number").or(z.literal("")),
  dob: z.string().optional(),
  gender: z.enum(["male", "female", "other", ""]).optional(),
});

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifySession();

  const raw = {
    name: (formData.get("name") as string) ?? "",
    phone: (formData.get("phone") as string) ?? "",
    dob: (formData.get("dob") as string) ?? "",
    gender: (formData.get("gender") as string) ?? "",
  };

  const parsed = ProfileSchema.safeParse(raw);
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  await adminDb.collection("users").doc(session.uid).update({
    name: parsed.data.name,
    phone: parsed.data.phone || null,
    dob: parsed.data.dob || null,
    gender: parsed.data.gender || null,
    updatedAt: Date.now(),
  });
  await adminAuth.updateUser(session.uid, { displayName: parsed.data.name });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  return { success: true, message: "Profile updated successfully." };
}

export async function uploadPhotoAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifySession();
  const file = formData.get("photo") as File | null;
  if (!file || file.size === 0) return { message: "Please select a photo." };
  if (file.size > 3 * 1024 * 1024) return { message: "Photo must be under 3 MB. Please compress the image and try again." };
  if (!file.type.startsWith("image/")) return { message: "Only image files are allowed." };

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!;

    if (!bucketName) {
      console.error("uploadPhotoAction: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is not set");
      return { message: "Storage not configured. Contact support." };
    }

    const bucket = adminStorage.bucket(bucketName);
    const ext = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
    const fileName = `users/${session.uid}/avatar_${Date.now()}.${ext}`;
    const fileRef = bucket.file(fileName);

    await fileRef.save(buffer, {
      metadata: { contentType: file.type },
      resumable: false,
    });

    // Generate a signed URL (15 years) — works with any Storage rules and any bucket format
    const [signedURL] = await fileRef.getSignedUrl({
      action: "read",
      expires: Date.now() + 15 * 365 * 24 * 60 * 60 * 1000, // 15 years
    });

    const photoURL = signedURL;
    console.log("uploadPhotoAction: saved to", photoURL);

    await adminDb.collection("users").doc(session.uid).set({ photoURL }, { merge: true });
    await adminAuth.updateUser(session.uid, { photoURL });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    return { success: true, message: "Photo updated.", redirect: photoURL };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("uploadPhotoAction error:", msg);
    return { message: `Upload failed: ${msg}` };
  }
}

const PasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifySession();
  const raw = {
    currentPassword: formData.get("currentPassword") as string,
    newPassword: formData.get("newPassword") as string,
  };
  const parsed = PasswordSchema.safeParse(raw);
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  // Verify current password via Firebase REST API
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!;
  const user = await adminAuth.getUser(session.uid);
  const verifyRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // returnSecureToken must be true — the REST API rejects false
      body: JSON.stringify({ email: user.email, password: parsed.data.currentPassword, returnSecureToken: true }),
    }
  );
  if (!verifyRes.ok) {
    const err = await verifyRes.json().catch(() => ({}));
    const code = (err?.error?.message ?? "") as string;
    if (code.includes("INVALID_PASSWORD") || code.includes("INVALID_LOGIN_CREDENTIALS") || code.includes("EMAIL_NOT_FOUND")) {
      return { errors: { currentPassword: ["Current password is incorrect."] } };
    }
    return { errors: { currentPassword: ["Could not verify current password. Please try again."] } };
  }

  await adminAuth.updateUser(session.uid, { password: parsed.data.newPassword });
  return { success: true, message: "Password changed successfully." };
}

export async function deleteAccountAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifySession();
  const confirm = formData.get("confirm") as string;
  if (confirm !== "DELETE") return { message: "Type DELETE to confirm." };

  // Delete Firestore subcollections first
  const batch = adminDb.batch();
  const userRef = adminDb.collection("users").doc(session.uid);
  batch.delete(userRef);
  await batch.commit();

  // Delete Firebase Auth user
  await adminAuth.deleteUser(session.uid);

  const { deleteSession } = await import("@/lib/session");
  await deleteSession();
  return { success: true, redirect: "/?deleted=1" };
}

export async function createNotification(
  uid: string,
  payload: { title: string; message: string; type: string; link?: string }
) {
  await adminDb
    .collection("notifications")
    .doc(uid)
    .collection("items")
    .add({ ...payload, read: false, createdAt: Date.now() });
}
