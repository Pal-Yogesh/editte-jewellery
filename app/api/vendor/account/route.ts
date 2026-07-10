import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { VENDOR_COLLECTION, getVendorCookieName } from "@/lib/auth/vendor";
import { VENDOR_OTP_COLLECTION } from "@/lib/vendor/otp";
import { getSessionVendor } from "@/lib/vendor/session";
import { deleteVendorFiles } from "@/lib/vendor/storage";

export async function DELETE() {
  const vendor = await getSessionVendor();
  if (!vendor) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  // Remove uploaded files, OTP records, and the vendor document.
  await deleteVendorFiles(vendor.vendorId);
  await db.collection(VENDOR_OTP_COLLECTION).doc(vendor.vendorId).delete().catch(() => {});
  await db.collection(VENDOR_COLLECTION).doc(vendor.vendorId).delete();

  const response = NextResponse.json(
    { message: "Your account has been deleted." },
    { status: 200 }
  );

  response.cookies.set({
    name: getVendorCookieName(),
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
