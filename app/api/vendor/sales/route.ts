import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { getSessionVendor } from "@/lib/vendor/session";
import { PRODUCT_COLLECTION } from "@/lib/product/types";
import { signPath } from "@/lib/vendor/storage";

export type SoldProductRow = {
  productId: string;
  title: string;
  sku: string;
  image: string;
  unitsSold: number;
  revenue: number;
  stockLeft: number;
};

export type RecentSaleRow = {
  orderId: string;
  invoiceNumber: string;
  productId: string;
  title: string;
  quantity: number;
  price: number;
  lineTotal: number;
  soldAt: number;
  customerName: string;
};

/**
 * Aggregates paid storefront orders for the logged-in vendor.
 * Prefers `item.vendorId` (set at checkout); falls back to product ownership
 * for older orders that predate that field.
 */
export async function GET() {
  const vendor = await getSessionVendor();
  if (!vendor) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  const vendorId = vendor.vendorId;

  // Vendor's product catalogue (for titles, images, stock, and legacy join)
  const productSnap = await db
    .collection(PRODUCT_COLLECTION)
    .where("vendorId", "==", vendorId)
    .get();

  const productMeta = new Map<
    string,
    { title: string; sku: string; imagePath: string; quantity: number }
  >();
  for (const doc of productSnap.docs) {
    const data = doc.data();
    const media = Array.isArray(data.media) ? data.media : [];
    const firstImage = media.find(
      (m: { kind?: string }) => (m.kind ?? "image") === "image"
    ) as { path?: string } | undefined;
    productMeta.set(doc.id, {
      title: (data.title as string) ?? "",
      sku: (data.sku as string) ?? "",
      imagePath: firstImage?.path ?? "",
      quantity: (data.quantity as number) ?? 0,
    });
  }
  const ownedIds = new Set(productMeta.keys());

  // Fresh signed URLs from storage paths (order/cart URLs expire)
  const signedImages = new Map<string, string>();
  await Promise.all(
    [...productMeta.entries()].map(async ([id, meta]) => {
      if (!meta.imagePath) return;
      signedImages.set(id, await signPath(meta.imagePath));
    })
  );

  const ordersSnap = await db.collection("orders").where("status", "==", "paid").get();

  const byProduct = new Map<
    string,
    { unitsSold: number; revenue: number; title: string; sku: string }
  >();
  const recent: RecentSaleRow[] = [];

  for (const orderDoc of ordersSnap.docs) {
    const order = orderDoc.data();
    const items = Array.isArray(order.items) ? order.items : [];
    const soldAt = (order.createdAt as number) ?? 0;
    const invoiceNumber = (order.invoiceNumber as string) ?? orderDoc.id;
    const customerName = (order.userName as string) ?? "Customer";

    for (const raw of items) {
      const item = raw as {
        productId?: string;
        name?: string;
        price?: number;
        quantity?: number;
        vendorId?: string;
        sku?: string;
      };
      const productId = item.productId ?? "";
      if (!productId) continue;

      const belongsToVendor =
        item.vendorId === vendorId ||
        (!item.vendorId && ownedIds.has(productId));
      if (!belongsToVendor) continue;

      const qty = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      if (qty <= 0) continue;

      const meta = productMeta.get(productId);
      const title = meta?.title || item.name || "Product";
      const sku = meta?.sku || item.sku || "";

      const existing = byProduct.get(productId);
      if (existing) {
        existing.unitsSold += qty;
        existing.revenue += price * qty;
      } else {
        byProduct.set(productId, {
          unitsSold: qty,
          revenue: price * qty,
          title,
          sku,
        });
      }

      recent.push({
        orderId: orderDoc.id,
        invoiceNumber,
        productId,
        title,
        quantity: qty,
        price,
        lineTotal: price * qty,
        soldAt,
        customerName,
      });
    }
  }

  recent.sort((a, b) => b.soldAt - a.soldAt);

  const products: SoldProductRow[] = [...byProduct.entries()]
    .map(([productId, row]) => ({
      productId,
      title: row.title,
      sku: row.sku,
      image: signedImages.get(productId) ?? "",
      unitsSold: row.unitsSold,
      revenue: Math.round(row.revenue * 100) / 100,
      stockLeft: productMeta.get(productId)?.quantity ?? 0,
    }))
    .sort((a, b) => b.unitsSold - a.unitsSold);

  const totalUnits = products.reduce((a, p) => a + p.unitsSold, 0);
  const totalRevenue = Math.round(products.reduce((a, p) => a + p.revenue, 0) * 100) / 100;

  return NextResponse.json({
    summary: {
      totalUnits,
      totalRevenue,
      productsSold: products.length,
      ordersWithSales: new Set(recent.map((r) => r.orderId)).size,
    },
    products,
    recent: recent.slice(0, 50),
  });
}
