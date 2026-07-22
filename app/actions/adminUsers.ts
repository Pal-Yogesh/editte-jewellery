"use server";
import { revalidatePath } from "next/cache";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { verifyAdmin } from "@/lib/dal";
import type { ActionState } from "./auth";

export async function assignAdminRoleAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifyAdmin();
  const uid = formData.get("uid") as string;
  if (!uid) return { message: "User ID required." };
  if (uid === session.uid) return { message: "You cannot change your own role." };

  await adminDb.collection("users").doc(uid).set({ role: "admin" }, { merge: true });
  revalidatePath("/admin/users");
  return { success: true, message: "Role updated to admin." };
}

export async function removeAdminRoleAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifyAdmin();
  const uid = formData.get("uid") as string;
  if (!uid) return { message: "User ID required." };
  if (uid === session.uid) return { message: "You cannot change your own role." };

  await adminDb.collection("users").doc(uid).set({ role: "customer" }, { merge: true });
  revalidatePath("/admin/users");
  return { success: true, message: "Role reverted to customer." };
}

export async function resetUserPasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await verifyAdmin();
  const uid = formData.get("uid") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!uid) return { message: "User ID required." };
  if (!newPassword || newPassword.length < 6)
    return { errors: { newPassword: ["Password must be at least 6 characters."] } };

  try {
    await adminAuth.updateUser(uid, { password: newPassword });
    return { success: true, message: "Password reset successfully." };
  } catch (err) {
    return { message: err instanceof Error ? err.message : "Failed to reset password." };
  }
}

export async function deleteUserAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifyAdmin();
  const uid = formData.get("uid") as string;
  if (!uid) return { message: "User ID required." };
  if (uid === session.uid) return { message: "You cannot delete your own account." };

  try {
    await adminAuth.deleteUser(uid);
    await adminDb.collection("users").doc(uid).delete();
  } catch { /* Auth user may not exist */ }

  revalidatePath("/admin/users");
  return { success: true, message: "User deleted." };
}
