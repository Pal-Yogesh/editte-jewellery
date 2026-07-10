import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { getAdminSession } from "@/lib/auth/admin";
import { VENDOR_COLLECTION, getVendorById } from "@/lib/auth/vendor";
import { serializeVendor } from "@/lib/vendor/serialize";

type Params = { params: Promise<{ id: string }> };

type PatchBody = {
  action?: "approve" | "reject";
  reason?: string;
};

export async function GET(_request: Request, { params }: Params) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;
  const vendor = await getVendorById(id);
  if (!vendor) {
    return NextResponse.json({ message: "Vendor not found." }, { status: 404 });
  }

  return NextResponse.json({ vendor: await serializeVendor(vendor) }, { status: 200 });
}

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

  const vendor = await getVendorById(id);
  if (!vendor) {
    return NextResponse.json({ message: "Vendor not found." }, { status: 404 });
  }

  const now = new Date().toISOString();

  if (body.action === "approve") {
    await db.collection(VENDOR_COLLECTION).doc(id).update({
      status: "approved",
      rejectionReason: null,
      approvedAt: now,
      approvedBy: admin.adminId,
      updatedAt: now,
    });
  } else if (body.action === "reject") {
    await db.collection(VENDOR_COLLECTION).doc(id).update({
      status: "rejected",
      rejectionReason: body.reason?.trim() || "Not specified.",
      approvedAt: null,
      approvedBy: null,
      updatedAt: now,
    });
  } else {
    return NextResponse.json(
      { message: "action must be 'approve' or 'reject'." },
      { status: 400 }
    );
  }

  const updated = await getVendorById(id);
  return NextResponse.json(
    {
      message: `Vendor ${body.action}d.`,
      vendor: updated ? await serializeVendor(updated) : null,
    },
    { status: 200 }
  );
}
