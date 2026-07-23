import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { getSessionVendor } from "@/lib/vendor/session";
import { deletePath } from "@/lib/vendor/storage";
import { PRODUCT_COLLECTION, normaliseProduct } from "@/lib/product/types";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const vendor = await getSessionVendor();
  if (!vendor) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;
  const ref = db.collection(PRODUCT_COLLECTION).doc(id);
  const doc = await ref.get();

  if (!doc.exists) {
    return NextResponse.json({ message: "Product not found." }, { status: 404 });
  }

  const product = normaliseProduct(doc.id, doc.data()!);
  if (product.vendorId !== vendor.vendorId) {
    return NextResponse.json({ message: "Not allowed." }, { status: 403 });
  }

  // Remove associated media files (best-effort), then the document.
  await Promise.all(product.media.map((m) => deletePath(m.path)));
  await ref.delete();

  return NextResponse.json({ message: "Product deleted." }, { status: 200 });
}
