import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { VENDOR_COLLECTION } from "@/lib/auth/vendor";
import { getSessionVendor } from "@/lib/vendor/session";
import { serializeVendor } from "@/lib/vendor/serialize";
import { deletePath, uploadVendorFile } from "@/lib/vendor/storage";

const MAX_LOGO_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

export async function POST(request: Request) {
  const vendor = await getSessionVendor();
  if (!vendor) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ message: "Invalid form data." }, { status: 400 });
  }

  const file = form.get("logo");
  if (!(file instanceof File)) {
    return NextResponse.json({ message: "No logo file provided." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { message: "Logo must be a PNG, JPEG, WebP, or SVG image." },
      { status: 400 }
    );
  }
  if (file.size > MAX_LOGO_BYTES) {
    return NextResponse.json({ message: "Logo must be 5 MB or smaller." }, { status: 400 });
  }

  const uploaded = await uploadVendorFile(vendor.vendorId, "logo", file);

  // Remove the previous logo, if any.
  if (vendor.profile.logoPath) {
    await deletePath(vendor.profile.logoPath);
  }

  await db.collection(VENDOR_COLLECTION).doc(vendor.vendorId).update({
    "profile.logoPath": uploaded.path,
    updatedAt: new Date().toISOString(),
  });

  const updated = await getSessionVendor();
  return NextResponse.json(
    { message: "Logo uploaded.", vendor: updated ? await serializeVendor(updated) : null },
    { status: 200 }
  );
}
