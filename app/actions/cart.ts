"use server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/dal";
import { revalidatePath } from "next/cache";
import type { ActionState } from "./auth";

export async function addToCartAction(
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

  const col = adminDb.collection("carts").doc(session.uid).collection("items");
  const existing = await col.where("productId", "==", productId).limit(1).get();

  if (!existing.empty) {
    const doc = existing.docs[0];
    await doc.ref.update({ quantity: doc.data().quantity + 1, updatedAt: Date.now() });
  } else {
    await col.add({ productId, name, image, price, category, quantity: 1, addedAt: Date.now() });
  }

  revalidatePath("/dashboard/cart");
  return { success: true, message: "Added to cart." };
}

export async function updateCartQuantityAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifySession();
  const id = formData.get("id") as string;
  const qty = Number(formData.get("quantity"));

  if (!id) return { message: "Item ID required." };
  if (qty < 1 || qty > 20) return { message: "Quantity must be 1–20." };

  await adminDb.collection("carts").doc(session.uid).collection("items").doc(id).update({
    quantity: qty,
    updatedAt: Date.now(),
  });

  revalidatePath("/dashboard/cart");
  return { success: true };
}

export async function removeFromCartAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifySession();
  const id = formData.get("id") as string;
  if (!id) return { message: "Item ID required." };

  await adminDb.collection("carts").doc(session.uid).collection("items").doc(id).delete();
  revalidatePath("/dashboard/cart");
  return { success: true };
}

export async function clearCartAction(): Promise<ActionState> {
  const session = await verifySession();
  const col = adminDb.collection("carts").doc(session.uid).collection("items");
  const all = await col.get();
  const batch = adminDb.batch();
  all.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  revalidatePath("/dashboard/cart");
  return { success: true };
}
