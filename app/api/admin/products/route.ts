import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { getAdminSession } from "@/lib/auth/admin";
import { VENDOR_COLLECTION } from "@/lib/auth/vendor";
import { serializeProduct } from "@/lib/product/serialize";
import {
  PRODUCT_COLLECTION,
  normaliseProduct,
  type ProductStatus,
} from "@/lib/product/types";

const VALID_STATUSES: ProductStatus[] = ["pending", "approved", "rejected"];

type VendorInfo = { brandName: string; email: string };

async function fetchVendorInfo(
  vendorIds: string[]
): Promise<Record<string, VendorInfo>> {
  const map: Record<string, VendorInfo> = {};
  await Promise.all(
    vendorIds.map(async (id) => {
      const doc = await db.collection(VENDOR_COLLECTION).doc(id).get();
      if (doc.exists) {
        const data = doc.data()!;
        map[id] = {
          brandName: (data.profile?.brandName as string) || "",
          email: (data.email as string) || "",
        };
      }
    })
  );
  return map;
}

export async function GET(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  const url = new URL(request.url);
  const statusParam = url.searchParams.get("status") as ProductStatus | null;

  let query: FirebaseFirestore.Query = db.collection(PRODUCT_COLLECTION);
  if (statusParam && VALID_STATUSES.includes(statusParam)) {
    query = query.where("status", "==", statusParam);
  }

  const snapshot = await query.get();
  const records = snapshot.docs
    .map((doc) => normaliseProduct(doc.id, doc.data()))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const vendorIds = [...new Set(records.map((p) => p.vendorId))];
  const vendorInfo = await fetchVendorInfo(vendorIds);

  const products = await Promise.all(
    records.map(async (record) => ({
      ...(await serializeProduct(record)),
      vendor: vendorInfo[record.vendorId] ?? { brandName: "", email: "" },
    }))
  );

  return NextResponse.json({ products }, { status: 200 });
}
