import { signPath } from "@/lib/vendor/storage";
import {
  getVendorCompleteness,
  type CompletenessResult,
} from "@/lib/vendor/completeness";
import type { VendorRecord } from "@/lib/vendor/types";

export type PublicVendorDocument = {
  id: string;
  name: string;
  contentType: string;
  uploadedAt: string;
  url: string;
};

/** A vendor object safe to return to clients: no password hash, signed file URLs. */
export type PublicVendor = Omit<VendorRecord, "passwordHash" | "profile" | "kyc"> & {
  profile: Omit<VendorRecord["profile"], "logoPath"> & { logoUrl: string };
  kyc: Omit<VendorRecord["kyc"], "documents"> & { documents: PublicVendorDocument[] };
  completeness: CompletenessResult;
};

export async function serializeVendor(vendor: VendorRecord): Promise<PublicVendor> {
  const [logoUrl, documents] = await Promise.all([
    signPath(vendor.profile.logoPath),
    Promise.all(
      vendor.kyc.documents.map(async (doc) => ({
        id: doc.id,
        name: doc.name,
        contentType: doc.contentType,
        uploadedAt: doc.uploadedAt,
        url: await signPath(doc.path),
      }))
    ),
  ]);

  const { passwordHash: _passwordHash, ...rest } = vendor;
  void _passwordHash;

  return {
    ...rest,
    profile: {
      brandName: vendor.profile.brandName,
      brandStory: vendor.profile.brandStory,
      about: vendor.profile.about,
      socialLinks: vendor.profile.socialLinks,
      logoUrl,
    },
    kyc: {
      gstNumber: vendor.kyc.gstNumber,
      panNumber: vendor.kyc.panNumber,
      documents,
    },
    completeness: getVendorCompleteness(vendor),
  };
}
