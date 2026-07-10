import { cookies } from "next/headers";
import {
  getVendorById,
  getVendorCookieName,
  verifyVendorToken,
} from "@/lib/auth/vendor";
import type { VendorRecord } from "@/lib/vendor/types";

export type VendorSession = {
  vendorId: string;
  email: string;
};

/** Reads and validates the vendor session from the request cookie. */
export async function getVendorSession(): Promise<VendorSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(getVendorCookieName())?.value;
  if (!token) return null;

  const payload = verifyVendorToken(token);
  if (!payload) return null;

  return { vendorId: payload.vendorId, email: payload.email };
}

/** Loads the full vendor record for the current session, or null if unauthenticated. */
export async function getSessionVendor(): Promise<VendorRecord | null> {
  const session = await getVendorSession();
  if (!session) return null;
  return getVendorById(session.vendorId);
}
