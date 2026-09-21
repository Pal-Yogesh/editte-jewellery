import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { getAdminSession } from "@/lib/auth/admin";
import { serializeProduct } from "@/lib/product/serialize";
import { normalisePlacements } from "@/lib/product/categories";
import { PRODUCT_COLLECTION, normaliseProduct } from "@/lib/product/types";

type Params = { params: Promise<{ id: string }> };

type PatchBody = {
  action?: "approve" | "reject" | "curate";
  reason?: string;
  /** curate: the rails this product should appear on. Replaces the whole set. */
  placements?: string[];
  /** curate: pull the listing off the site without rejecting it. */
  visibleOnSite?: boolean;
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

  const existing = normaliseProduct(id, doc.data()!);
  const now = new Date().toISOString();

  if (body.action === "approve") {
    await ref.update({
      status: "approved",
      rejectionReason: null,
      // Approving puts the listing on the site; the rails it appears on are
      // curated separately, so a fresh approval grants no placements.
      visibleOnSite: true,
      updatedAt: now,
    });
  } else if (body.action === "reject") {
    await ref.update({
      status: "rejected",
      rejectionReason: body.reason?.trim() || "Not specified.",
      updatedAt: now,
    });
  } else if (body.action === "curate") {
    if (existing.status !== "approved") {
      return NextResponse.json(
        { message: "Approve the product before choosing where it appears." },
        { status: 400 }
      );
    }

    const patch: Record<string, unknown> = { updatedAt: now };
    if (body.placements !== undefined) {
      patch.placements = normalisePlacements(body.placements);
    }
    if (body.visibleOnSite !== undefined) {
      patch.visibleOnSite = body.visibleOnSite === true;
    }
    if (Object.keys(patch).length === 1) {
      return NextResponse.json(
        { message: "Nothing to change — send placements or visibleOnSite." },
        { status: 400 }
      );
    }

    await ref.update(patch);
  } else {
    return NextResponse.json(
      { message: "action must be 'approve', 'reject' or 'curate'." },
      { status: 400 }
    );
  }

  const updated = normaliseProduct(id, (await ref.get()).data()!);
  const message =
    body.action === "curate" ? "Display settings saved." : `Product ${body.action}d.`;

  return NextResponse.json(
    { message, product: await serializeProduct(updated) },
    { status: 200 }
  );
}
