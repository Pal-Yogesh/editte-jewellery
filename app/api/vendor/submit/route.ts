import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { VENDOR_COLLECTION } from "@/lib/auth/vendor";
import { getSessionVendor } from "@/lib/vendor/session";
import { serializeVendor } from "@/lib/vendor/serialize";
import { getVendorCompleteness } from "@/lib/vendor/completeness";
import { sendAdminVendorSubmissionAlert } from "@/lib/resend";

const ADMIN_COLLECTION = "admin_credentials";

export async function POST() {
  const vendor = await getSessionVendor();
  if (!vendor) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  if (vendor.status === "under_review" || vendor.status === "pending") {
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
    status: "under_review",
    rejectionReason: null,
    updatedAt: new Date().toISOString(),
  });

  // Notify admin(s) via email (best-effort)
  try {
    const adminSnapshot = await db.collection(ADMIN_COLLECTION).get();
    const adminEmails: string[] = [];
    adminSnapshot.forEach((doc) => {
      const email = doc.data().email as string | undefined;
      if (email) adminEmails.push(email);
    });
    await Promise.all(
      adminEmails.map((email) =>
        sendAdminVendorSubmissionAlert(
          email,
          vendor.profile.brandName || "Unnamed Vendor",
          vendor.email
        )
      )
    );
  } catch {
    // Email failure should not block submission
  }

  const updated = await getSessionVendor();
  return NextResponse.json(
    {
      message: "Profile submitted for approval.",
      vendor: updated ? await serializeVendor(updated) : null,
    },
    { status: 200 }
  );
}
