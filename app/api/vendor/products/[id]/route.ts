import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { getSessionVendor } from "@/lib/vendor/session";
import { deletePath } from "@/lib/vendor/storage";
import { PRODUCT_COLLECTION, normaliseProduct } from "@/lib/product/types";
import { serializeProduct } from "@/lib/product/serialize";
import {
  buildMediaFromForm,
  parseProductFields,
  parseRetainedMediaIds,
  productUpdatePayload,
} from "@/lib/product/vendor-product-mutation";

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

  await Promise.all(product.media.map((m) => deletePath(m.path)));
  await ref.delete();

  return NextResponse.json({ message: "Product deleted." }, { status: 200 });
}

export async function PATCH(request: Request, { params }: Params) {
  const vendor = await getSessionVendor();
  if (!vendor) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  if (vendor.status !== "approved") {
    return NextResponse.json(
      { message: "Your account must be approved before you can edit products." },
      { status: 403 }
    );
  }

  const { id } = await params;
  const ref = db.collection(PRODUCT_COLLECTION).doc(id);
  const doc = await ref.get();

  if (!doc.exists) {
    return NextResponse.json({ message: "Product not found." }, { status: 404 });
  }

  const existing = normaliseProduct(doc.id, doc.data()!);
  if (existing.vendorId !== vendor.vendorId) {
    return NextResponse.json({ message: "Not allowed." }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ message: "Invalid form data." }, { status: 400 });
  }

  const fields = parseProductFields(form, vendor.profile.brandName);
  if ("error" in fields) {
    return NextResponse.json({ message: fields.error }, { status: fields.status });
  }

  const retainedMediaIds = parseRetainedMediaIds(form);
  const mediaResult = await buildMediaFromForm(
    form,
    vendor.vendorId,
    existing.media,
    retainedMediaIds
  );
  if ("error" in mediaResult) {
    return NextResponse.json(
      { message: mediaResult.error },
      { status: mediaResult.status }
    );
  }

  await Promise.all(mediaResult.removed.map((m) => deletePath(m.path)));

  const payload = productUpdatePayload(fields, mediaResult.media, existing);
  await ref.update(payload);

  const updated = normaliseProduct(id, (await ref.get()).data()!);
  const wasApproved = existing.status === "approved";

  return NextResponse.json(
    {
      message: wasApproved
        ? "Product updated and sent for admin review."
        : "Product updated.",
      product: await serializeProduct(updated),
    },
    { status: 200 }
  );
}
