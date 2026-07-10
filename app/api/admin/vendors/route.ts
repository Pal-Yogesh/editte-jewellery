import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { getAdminSession } from "@/lib/auth/admin";
import { VENDOR_COLLECTION, normaliseVendor } from "@/lib/auth/vendor";
import { serializeVendor } from "@/lib/vendor/serialize";
import type { VendorStatus } from "@/lib/vendor/types";

const VALID_STATUSES: VendorStatus[] = ["pending", "approved", "rejected"];

export async function GET(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  const url = new URL(request.url);
  const statusParam = url.searchParams.get("status") as VendorStatus | null;

  let query: FirebaseFirestore.Query = db.collection(VENDOR_COLLECTION);
  if (statusParam && VALID_STATUSES.includes(statusParam)) {
    query = query.where("status", "==", statusParam);
  } else {
    // Never surface vendors who haven't submitted their completed profile yet.
    query = query.where("status", "in", ["pending", "approved", "rejected"]);
  }

  const snapshot = await query.get();
  const vendors = await Promise.all(
    snapshot.docs
      .map((doc) => normaliseVendor(doc.id, doc.data()))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .map((vendor) => serializeVendor(vendor))
  );

  return NextResponse.json({ vendors }, { status: 200 });
}
