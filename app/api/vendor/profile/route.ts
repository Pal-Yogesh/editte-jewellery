import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { VENDOR_COLLECTION } from "@/lib/auth/vendor";
import { getSessionVendor } from "@/lib/vendor/session";
import { serializeVendor } from "@/lib/vendor/serialize";
import type { VendorSocialLinks } from "@/lib/vendor/types";

type ProfileBody = {
  brandName?: string;
  brandStory?: string;
  about?: string;
  socialLinks?: VendorSocialLinks;
};

function cleanUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

export async function PUT(request: Request) {
  const vendor = await getSessionVendor();
  if (!vendor) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  let body: ProfileBody;
  try {
    body = (await request.json()) as ProfileBody;
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const socialLinks: VendorSocialLinks = {
    website: cleanUrl(body.socialLinks?.website),
    instagram: cleanUrl(body.socialLinks?.instagram),
    facebook: cleanUrl(body.socialLinks?.facebook),
    youtube: cleanUrl(body.socialLinks?.youtube),
    twitter: cleanUrl(body.socialLinks?.twitter),
  };

  const updatedProfile = {
    brandName: (body.brandName ?? vendor.profile.brandName).trim(),
    brandStory: (body.brandStory ?? vendor.profile.brandStory).trim(),
    about: (body.about ?? vendor.profile.about).trim(),
    logoPath: vendor.profile.logoPath,
    socialLinks,
  };

  await db.collection(VENDOR_COLLECTION).doc(vendor.vendorId).update({
    profile: updatedProfile,
    updatedAt: new Date().toISOString(),
  });

  const updated = await getSessionVendor();
  return NextResponse.json(
    { message: "Profile updated.", vendor: updated ? await serializeVendor(updated) : null },
    { status: 200 }
  );
}
