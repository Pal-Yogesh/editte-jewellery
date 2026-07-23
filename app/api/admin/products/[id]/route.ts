import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { getAdminSession } from "@/lib/auth/admin";
import { serializeProduct } from "@/lib/product/serialize";
import { PRODUCT_COLLECTION, normaliseProduct } from "@/lib/product/types";

type Params = { params: Promise<{ id: string }> };

type PatchBody = {
  action?: "approve" | "reject";
  reason?: string;
};

export async function PATCH(request: Request, { params }: Params) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const ref = db.collection(PRODUCT_COLLECTION).doc(id);
  const doc = await ref.get();
  if (!doc.exists) {
    return NextResponse.json({ message: "Product not found." }, { status: 404 });
  }

  const now = new Date().toISOString();

  if (body.action === "approve") {
    await ref.update({ status: "approved", rejectionReason: null, updatedAt: now });
  } else if (body.action === "reject") {
    await ref.update({
      status: "rejected",
      rejectionReason: body.reason?.trim() || "Not specified.",
      updatedAt: now,
    });
  } else {
    return NextResponse.json(
      { message: "action must be 'approve' or 'reject'." },
      { status: 400 }
    );
  }

  const updated = normaliseProduct(id, (await ref.get()).data()!);
  return NextResponse.json(
    { message: `Product ${body.action}d.`, product: await serializeProduct(updated) },
    { status: 200 }
  );
}
