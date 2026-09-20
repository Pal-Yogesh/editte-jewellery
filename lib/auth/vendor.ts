import bcrypt from "bcryptjs";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { db } from "@/lib/firebase-admin";
import {
  createEmptyBankDetails,
  createEmptyPickupAddress,
  createEmptyVendorKyc,
  createEmptyVendorProfile,
  createEmptyVendorShipping,
  type VendorRecord,
} from "@/lib/vendor/types";

type VendorJwtPayload = JwtPayload & {
  role: "vendor";
  vendorId: string;
  email: string;
};

const TOKEN_EXPIRES_IN = "12h";
const VENDOR_COOKIE_NAME = "vendor_token";
export const VENDOR_COLLECTION = "vendors";
export const SALT_ROUNDS = 12;

export function getVendorCookieName(): string {
  return VENDOR_COOKIE_NAME;
}

export function getJwtSecret(): string {
  const value = process.env.JWT_SECRET;
  if (!value) {
    throw new Error("Missing required environment variable: JWT_SECRET");
  }
  return value;
}

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export async function verifyVendorPassword(
  plainPassword: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}

/** Normalises a stored Firestore document into a fully-shaped VendorRecord. */
export function normaliseVendor(
  vendorId: string,
  data: FirebaseFirestore.DocumentData
): VendorRecord {
  return {
    vendorId,
    email: (data.email as string) ?? "",
    passwordHash: (data.passwordHash as string) ?? "",
    emailVerified: Boolean(data.emailVerified),
    status: (data.status as VendorRecord["status"]) ?? "incomplete",
    rejectionReason: (data.rejectionReason as string | null) ?? null,
    profile: { ...createEmptyVendorProfile(), ...(data.profile ?? {}) },
    kyc: { ...createEmptyVendorKyc(), ...(data.kyc ?? {}) },
    bankDetails: { ...createEmptyBankDetails(), ...(data.bankDetails ?? {}) },
    pickupAddress: {
      ...createEmptyPickupAddress(),
      ...(data.pickupAddress ?? {}),
    },
    commission: {
      accepted: Boolean(data.commission?.accepted),
      acceptedAt: (data.commission?.acceptedAt as string | null) ?? null,
    },
    shipping: { ...createEmptyVendorShipping(), ...(data.shipping ?? {}) },
    createdAt: (data.createdAt as string) ?? "",
    updatedAt: (data.updatedAt as string) ?? "",
    approvedAt: (data.approvedAt as string | null) ?? null,
    approvedBy: (data.approvedBy as string | null) ?? null,
  };
}

export async function getVendorById(
  vendorId: string
): Promise<VendorRecord | null> {
  const doc = await db.collection(VENDOR_COLLECTION).doc(vendorId).get();
  if (!doc.exists) return null;
  return normaliseVendor(doc.id, doc.data()!);
}

export async function getVendorByEmail(
  email: string
): Promise<VendorRecord | null> {
  const snapshot = await db
    .collection(VENDOR_COLLECTION)
    .where("email", "==", email.toLowerCase())
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return normaliseVendor(doc.id, doc.data());
}

export function signVendorToken(vendorId: string, email: string): string {
  const secret = getJwtSecret();
  return jwt.sign({ role: "vendor", vendorId, email }, secret, {
    expiresIn: TOKEN_EXPIRES_IN,
  });
}

export function verifyVendorToken(token: string): VendorJwtPayload | null {
  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded === "object" &&
      decoded !== null &&
      decoded.role === "vendor" &&
      typeof decoded.vendorId === "string" &&
      typeof decoded.email === "string"
    ) {
      return decoded as VendorJwtPayload;
    }
    return null;
  } catch {
    return null;
  }
}
