import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { VENDOR_COLLECTION } from "@/lib/auth/vendor";
import { getSessionVendor } from "@/lib/vendor/session";
import { serializeVendor } from "@/lib/vendor/serialize";
import { getVendorCompleteness } from "@/lib/vendor/completeness";

/**
 * Submits a completed vendor profile for admin approval. Only vendors whose
 * profile is fully filled out (and who are not already pending/approved) can
 * be submitted — this is what makes them appear in the admin approval queue.
 */
export async function POST() {
  const vendor = await getSessionVendor();
  if (!vendor) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  if (vendor.status === "pending") {
    return NextResponse.json(
      { message: "Your profile is already submitted and awaiting approval." },
      { status: 400 }
    );
  }
  if (vendor.status === "approved") {
    return NextResponse.json(
      { message: "Your account is already approved." },
      { status: 400 }
    );
  }

  const { complete, missing } = getVendorCompleteness(vendor);
  if (!complete) {
    return NextResponse.json(
      {
        message: "Please complete all required sections before submitting.",
        missing,
      },
      { status: 400 }
    );
  }

  await db.collection(VENDOR_COLLECTION).doc(vendor.vendorId).update({
    status: "pending",
    rejectionReason: null,
    updatedAt: new Date().toISOString(),
  });

  const updated = await getSessionVendor();
  return NextResponse.json(
    {
      message: "Profile submitted for approval.",
      vendor: updated ? await serializeVendor(updated) : null,
    },
    { status: 200 }
  );
}
