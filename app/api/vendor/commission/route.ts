import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { VENDOR_COLLECTION } from "@/lib/auth/vendor";
import { getSessionVendor } from "@/lib/vendor/session";
import { serializeVendor } from "@/lib/vendor/serialize";

type CommissionBody = {
  accepted?: boolean;
};

export async function POST(request: Request) {
  const vendor = await getSessionVendor();
  if (!vendor) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  let body: CommissionBody;
  try {
    body = (await request.json()) as CommissionBody;
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  if (body.accepted !== true) {
    return NextResponse.json(
      { message: "You must accept the commission agreement to continue." },
      { status: 400 }
    );
  }

  await db.collection(VENDOR_COLLECTION).doc(vendor.vendorId).update({
    commission: { accepted: true, acceptedAt: new Date().toISOString() },
    updatedAt: new Date().toISOString(),
  });

  const updated = await getSessionVendor();
  return NextResponse.json(
    {
      message: "Commission agreement accepted.",
      vendor: updated ? await serializeVendor(updated) : null,
    },
    { status: 200 }
  );
}
