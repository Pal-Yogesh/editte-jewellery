import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { getSessionVendor } from "@/lib/vendor/session";
import { PRODUCT_COLLECTION, normaliseProduct } from "@/lib/product/types";

export async function PATCH(request: Request) {
  const vendor = await getSessionVendor();
  if (!vendor) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  let body: { updates: { productId: string; quantity: number }[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  if (!Array.isArray(body.updates) || body.updates.length === 0) {
    return NextResponse.json(
      { message: "Provide at least one update with productId and quantity." },
      { status: 400 }
    );
  }

  const errors: { productId: string; message: string }[] = [];
  const now = new Date().toISOString();

  for (const { productId, quantity } of body.updates) {
    if (!productId) {
      errors.push({ productId: "", message: "productId is required." });
      continue;
    }
    if (!Number.isFinite(quantity) || quantity < 0) {
      errors.push({ productId, message: "Quantity must be a non-negative number." });
      continue;
    }

    const ref = db.collection(PRODUCT_COLLECTION).doc(productId);
    const doc = await ref.get();

    if (!doc.exists) {
      errors.push({ productId, message: "Product not found." });
      continue;
    }

    const product = normaliseProduct(doc.id, doc.data()!);
    if (product.vendorId !== vendor.vendorId) {
      errors.push({ productId, message: "Not allowed." });
      continue;
    }

    await ref.update({ quantity, updatedAt: now });
  }

  return NextResponse.json(
    {
      message: errors.length === 0
        ? "Quantities updated."
        : `${body.updates.length - errors.length} updated, ${errors.length} failed.`,
      errors: errors.length > 0 ? errors : undefined,
    },
    { status: errors.length === body.updates.length ? 400 : 200 }
  );
}
