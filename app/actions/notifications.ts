"use server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/dal";
import { revalidatePath } from "next/cache";
import type { ActionState } from "./auth";

export async function markNotificationReadAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifySession();
  const id = formData.get("id") as string;
  if (!id) return { message: "Notification ID required." };

  await adminDb
    .collection("notifications")
    .doc(session.uid)
    .collection("items")
    .doc(id)
    .update({ read: true });

  revalidatePath("/dashboard/notifications");
  return { success: true };
}

export async function markAllReadAction(
  _prev: ActionState,
  _formData: FormData
): Promise<ActionState> {
  const session = await verifySession();
  const col = adminDb.collection("notifications").doc(session.uid).collection("items");
  const unread = await col.where("read", "==", false).get();
  const batch = adminDb.batch();
  unread.docs.forEach((d) => batch.update(d.ref, { read: true }));
  await batch.commit();
  revalidatePath("/dashboard/notifications");
  return { success: true };
}
