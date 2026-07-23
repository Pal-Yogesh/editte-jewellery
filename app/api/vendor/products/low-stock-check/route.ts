import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import {
  PRODUCT_COLLECTION,
  normaliseProduct,
} from "@/lib/product/types";
import { sendLowStockAlert, type LowStockProduct } from "@/lib/resend";

type CheckItem = {
  productId: string;
  quantity: number;
};

export async function POST(request: Request) {
  const authHeader = request.headers.get("x-api-key");
  const expectedKey = process.env.INTERNAL_API_KEY;
  if (expectedKey && authHeader !== expectedKey) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  let body: { items: CheckItem[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ message: "Items array is required." }, { status: 400 });
  }

  const lowStockByVendor = new Map<string, LowStockProduct[]>();
  const vendorIds = new Set<string>();

  for (const item of body.items) {
    const doc = await db.collection(PRODUCT_COLLECTION).doc(item.productId).get();
    if (!doc.exists) continue;

    const product = normaliseProduct(doc.id, doc.data()!);

    if (product.minQuantity <= 0) continue;
    if (item.quantity > product.minQuantity) continue;

    vendorIds.add(product.vendorId);
    const entry: LowStockProduct = {
      title: product.title,
      sku: product.sku,
      quantity: item.quantity,
      minQuantity: product.minQuantity,
    };

    const existing = lowStockByVendor.get(product.vendorId);
    if (existing) {
      existing.push(entry);
    } else {
      lowStockByVendor.set(product.vendorId, [entry]);
    }
  }

  if (lowStockByVendor.size === 0) {
    return NextResponse.json({ notified: 0, lowStockProducts: 0 });
  }

  const vendorSnapshots = await db
    .collection("vendors")
    .where("vendorId", "in", Array.from(vendorIds))
    .get();

  const vendorMap = new Map<string, { email: string; brandName: string }>();
  vendorSnapshots.forEach((doc) => {
    const data = doc.data();
    vendorMap.set(data.vendorId as string, {
      email: data.email as string,
      brandName: (data.profile?.brandName as string) || "Vendor",
    });
  });

  let notifiedVendors = 0;
  let totalLowStock = 0;

  for (const [vendorId, products] of lowStockByVendor) {
    const vendor = vendorMap.get(vendorId);
    if (!vendor) continue;

    try {
      await sendLowStockAlert(vendor.email, vendor.brandName, products);
      notifiedVendors++;
      totalLowStock += products.length;
    } catch {
      // Log but don't fail the whole request
      console.error(`Failed to send low-stock email to vendor ${vendorId}`);
    }
  }

  return NextResponse.json({
    notified: notifiedVendors,
    lowStockProducts: totalLowStock,
  });
}
