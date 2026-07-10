import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { VENDOR_COLLECTION } from "@/lib/auth/vendor";
import { getSessionVendor } from "@/lib/vendor/session";
import { serializeVendor } from "@/lib/vendor/serialize";

type AddressBody = {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
};

export async function PUT(request: Request) {
  const vendor = await getSessionVendor();
  if (!vendor) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  let body: AddressBody;
  try {
    body = (await request.json()) as AddressBody;
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const pickupAddress = {
    line1: (body.line1 ?? vendor.pickupAddress.line1).trim(),
    line2: (body.line2 ?? vendor.pickupAddress.line2).trim(),
    city: (body.city ?? vendor.pickupAddress.city).trim(),
    state: (body.state ?? vendor.pickupAddress.state).trim(),
    pincode: (body.pincode ?? vendor.pickupAddress.pincode).trim(),
    phone: (body.phone ?? vendor.pickupAddress.phone).trim(),
  };

  await db.collection(VENDOR_COLLECTION).doc(vendor.vendorId).update({
    pickupAddress,
    updatedAt: new Date().toISOString(),
  });

  const updated = await getSessionVendor();
  return NextResponse.json(
    { message: "Pickup address updated.", vendor: updated ? await serializeVendor(updated) : null },
    { status: 200 }
  );
}
