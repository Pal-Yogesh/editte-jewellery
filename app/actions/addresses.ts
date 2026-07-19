"use server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/dal";
import { revalidatePath } from "next/cache";
import type { ActionState } from "./auth";

const AddressSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit number"),
  line1: z.string().min(5, "Address line is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  country: z.string().default("India"),
});

export async function addAddressAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifySession();
  const raw = Object.fromEntries(formData.entries());
  const parsed = AddressSchema.safeParse(raw);
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const col = adminDb.collection("addresses").doc(session.uid).collection("items");
  const existing = await col.get();

  await col.add({
    ...parsed.data,
    isDefault: existing.empty, // first address is default
    createdAt: Date.now(),
  });

  revalidatePath("/dashboard/addresses");
  return { success: true, message: "Address saved." };
}

export async function updateAddressAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifySession();
  const id = formData.get("id") as string;
  if (!id) return { message: "Address ID missing." };

  const raw = Object.fromEntries(formData.entries());
  const parsed = AddressSchema.safeParse(raw);
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  await adminDb
    .collection("addresses")
    .doc(session.uid)
    .collection("items")
    .doc(id)
    .update({ ...parsed.data, updatedAt: Date.now() });

  revalidatePath("/dashboard/addresses");
  return { success: true, message: "Address updated." };
}

export async function deleteAddressAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifySession();
  const id = formData.get("id") as string;
  if (!id) return { message: "Address ID missing." };

  const col = adminDb.collection("addresses").doc(session.uid).collection("items");
  const docRef = col.doc(id);
  const snap = await docRef.get();
  const wasDefault = snap.data()?.isDefault ?? false;

  await docRef.delete();

  // If deleted was default, assign default to first remaining
  if (wasDefault) {
    const remaining = await col.orderBy("createdAt").limit(1).get();
    if (!remaining.empty) {
      await remaining.docs[0].ref.update({ isDefault: true });
    }
  }

  revalidatePath("/dashboard/addresses");
  return { success: true };
}

export async function setDefaultAddressAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifySession();
  const id = formData.get("id") as string;
  if (!id) return { message: "Address ID missing." };

  const col = adminDb.collection("addresses").doc(session.uid).collection("items");
  const all = await col.get();
  const batch = adminDb.batch();

  all.docs.forEach((doc) => {
    batch.update(doc.ref, { isDefault: doc.id === id });
  });

  await batch.commit();
  revalidatePath("/dashboard/addresses");
  return { success: true };
}
