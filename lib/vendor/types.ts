export type VendorStatus = "incomplete" | "pending" | "under_review" | "approved" | "rejected";

export type OtpPurpose = "signup" | "login" | "reset";

export type VendorSocialLinks = {
  website?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  twitter?: string;
};

export type VendorProfile = {
  brandName: string;
  brandStory: string;
  about: string;
  logoPath: string;
  socialLinks: VendorSocialLinks;
};

export type VendorDocument = {
  id: string;
  name: string;
  path: string;
  contentType: string;
  uploadedAt: string;
};

export type VendorKyc = {
  gstNumber: string;
  panNumber: string;
  documents: VendorDocument[];
};

export type VendorBankDetails = {
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
};

export type VendorPickupAddress = {
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
};

export type VendorCommission = {
  accepted: boolean;
  acceptedAt: string | null;
};

export type VendorRecord = {
  vendorId: string;
  email: string;
  passwordHash: string;
  emailVerified: boolean;
  status: VendorStatus;
  rejectionReason: string | null;
  profile: VendorProfile;
  kyc: VendorKyc;
  bankDetails: VendorBankDetails;
  pickupAddress: VendorPickupAddress;
  commission: VendorCommission;
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
};

/** Maximum number of KYC / business documents a vendor may upload. */
export const MAX_VENDOR_DOCUMENTS = 10;

export function createEmptyVendorProfile(): VendorProfile {
  return {
    brandName: "",
    brandStory: "",
    about: "",
    logoPath: "",
    socialLinks: {},
  };
}

export function createEmptyVendorKyc(): VendorKyc {
  return {
    gstNumber: "",
    panNumber: "",
    documents: [],
  };
}

export function createEmptyBankDetails(): VendorBankDetails {
  return {
    accountHolder: "",
    accountNumber: "",
    ifsc: "",
    bankName: "",
  };
}

export function createEmptyPickupAddress(): VendorPickupAddress {
  return {
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  };
}
