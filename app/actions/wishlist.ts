"use server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/dal";
import { revalidatePath } from "next/cache";
import type { ActionState } from "./auth";

export async function addToWishlistAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifySession();
  const productId = formData.get("productId") as string;
  const name = formData.get("name") as string;
  const image = formData.get("image") as string;
  const price = Number(formData.get("price"));
  const category = formData.get("category") as string;

  if (!productId) return { message: "Product ID required." };

  const col = adminDb.collection("wishlist").doc(session.uid).collection("items");
  // Prevent duplicates
  const existing = await col.where("productId", "==", productId).limit(1).get();
  if (!existing.empty) return { success: true, message: "Already in wishlist." };

  await col.add({ productId, name, image, price, category, addedAt: Date.now() });
  revalidatePath("/dashboard/wishlist");
  return { success: true, message: "Added to wishlist." };
}

export async function removeFromWishlistAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifySession();
  const id = formData.get("id") as string;
  if (!id) return { message: "Item ID required." };

  await adminDb.collection("wishlist").doc(session.uid).collection("items").doc(id).delete();
  revalidatePath("/dashboard/wishlist");
  return { success: true };
}
