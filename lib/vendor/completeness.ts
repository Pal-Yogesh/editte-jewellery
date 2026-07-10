import type { VendorRecord } from "@/lib/vendor/types";

export type CompletenessResult = {
  complete: boolean;
  missing: string[];
};

/**
 * Determines whether a vendor has filled out every required section of the
 * onboarding form. A vendor may only be submitted for admin approval once this
 * returns `complete: true`.
 */
export function getVendorCompleteness(v: VendorRecord): CompletenessResult {
  const missing: string[] = [];

  if (!v.profile.brandName.trim()) missing.push("Brand name");
  if (!v.profile.brandStory.trim()) missing.push("Brand story");
  if (!v.profile.about.trim()) missing.push("About section");
  if (!v.profile.logoPath) missing.push("Brand logo");

  if (!v.kyc.gstNumber.trim()) missing.push("GST number");
  if (!v.kyc.panNumber.trim()) missing.push("PAN number");
  if (v.kyc.documents.length === 0) missing.push("At least one business document");

  if (!v.bankDetails.accountHolder.trim()) missing.push("Bank account holder");
  if (!v.bankDetails.accountNumber.trim()) missing.push("Bank account number");
  if (!v.bankDetails.ifsc.trim()) missing.push("Bank IFSC code");
  if (!v.bankDetails.bankName.trim()) missing.push("Bank name");

  if (!v.pickupAddress.line1.trim()) missing.push("Pickup address");
  if (!v.pickupAddress.city.trim()) missing.push("Pickup city");
  if (!v.pickupAddress.state.trim()) missing.push("Pickup state");
  if (!v.pickupAddress.pincode.trim()) missing.push("Pickup pincode");
  if (!v.pickupAddress.phone.trim()) missing.push("Pickup phone");

  if (!v.commission.accepted) missing.push("Commission agreement");

  return { complete: missing.length === 0, missing };
}
