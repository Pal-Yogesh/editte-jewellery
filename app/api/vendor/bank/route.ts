import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { VENDOR_COLLECTION } from "@/lib/auth/vendor";
import { getSessionVendor } from "@/lib/vendor/session";
import { serializeVendor } from "@/lib/vendor/serialize";

type BankBody = {
  accountHolder?: string;
  accountNumber?: string;
  ifsc?: string;
  bankName?: string;
};

export async function PUT(request: Request) {
  const vendor = await getSessionVendor();
  if (!vendor) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  let body: BankBody;
  try {
    body = (await request.json()) as BankBody;
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const bankDetails = {
    accountHolder: (body.accountHolder ?? vendor.bankDetails.accountHolder).trim(),
    accountNumber: (body.accountNumber ?? vendor.bankDetails.accountNumber).trim(),
    ifsc: (body.ifsc ?? vendor.bankDetails.ifsc).trim().toUpperCase(),
    bankName: (body.bankName ?? vendor.bankDetails.bankName).trim(),
  };

  await db.collection(VENDOR_COLLECTION).doc(vendor.vendorId).update({
    bankDetails,
    updatedAt: new Date().toISOString(),
  });

  const updated = await getSessionVendor();
  return NextResponse.json(
    { message: "Bank details updated.", vendor: updated ? await serializeVendor(updated) : null },
    { status: 200 }
  );
}
