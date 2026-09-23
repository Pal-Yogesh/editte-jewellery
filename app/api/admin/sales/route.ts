import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { getAdminSession } from "@/lib/auth/admin";
import { VENDOR_COLLECTION } from "@/lib/auth/vendor";
import { PRODUCT_COLLECTION } from "@/lib/product/types";
import { signPath } from "@/lib/vendor/storage";

export type AdminSoldProductRow = {
  productId: string;
  title: string;
  sku: string;
  image: string;
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  unitsSold: number;
  revenue: number;
  stockLeft: number;
};

export type AdminVendorSalesRow = {
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  unitsSold: number;
  revenue: number;
  productsSold: number;
  ordersWithSales: number;
};

export type AdminRecentSaleRow = {
  orderId: string;
  invoiceNumber: string;
  productId: string;
  title: string;
  vendorId: string;
  vendorName: string;
  quantity: number;
  price: number;
  lineTotal: number;
  soldAt: number;
  customerName: string;
};

/**
 * Platform-wide sales for admin: which vendor sold which product.
 * Live from paid Firestore orders (same source as vendor Sales tab).
 */
export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  const [productSnap, vendorSnap, ordersSnap] = await Promise.all([
    db.collection(PRODUCT_COLLECTION).get(),
    db.collection(VENDOR_COLLECTION).get(),
    db.collection("orders").where("status", "==", "paid").get(),
  ]);

  const vendorInfo = new Map<string, { name: string; email: string }>();
  for (const doc of vendorSnap.docs) {
    const data = doc.data();
    vendorInfo.set(doc.id, {
      name: (data.profile?.brandName as string) || "(no brand)",
      email: (data.email as string) || "",
    });
  }

  const productMeta = new Map<
    string,
    {
      title: string;
      sku: string;
      imagePath: string;
      quantity: number;
      vendorId: string;
    }
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
      vendorId: (data.vendorId as string) ?? "",
    });
  }

  const signedImages = new Map<string, string>();
  await Promise.all(
    [...productMeta.entries()].map(async ([id, meta]) => {
      if (!meta.imagePath) return;
      signedImages.set(id, await signPath(meta.imagePath));
    })
  );

  type ProductAgg = {
    unitsSold: number;
    revenue: number;
    title: string;
    sku: string;
    vendorId: string;
  };
  type VendorAgg = {
    unitsSold: number;
    revenue: number;
    productIds: Set<string>;
    orderIds: Set<string>;
  };

  const byProduct = new Map<string, ProductAgg>();
  const byVendor = new Map<string, VendorAgg>();
  const recent: AdminRecentSaleRow[] = [];

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

      const meta = productMeta.get(productId);
      const vendorId =
        item.vendorId || meta?.vendorId || "";
      if (!vendorId) continue;

      const qty = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      if (qty <= 0) continue;

      const title = meta?.title || item.name || "Product";
      const sku = meta?.sku || item.sku || "";
      const vInfo = vendorInfo.get(vendorId);
      const vendorName = vInfo?.name ?? vendorId;

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
          vendorId,
        });
      }

      let vAgg = byVendor.get(vendorId);
      if (!vAgg) {
        vAgg = {
          unitsSold: 0,
          revenue: 0,
          productIds: new Set(),
          orderIds: new Set(),
        };
        byVendor.set(vendorId, vAgg);
      }
      vAgg.unitsSold += qty;
      vAgg.revenue += price * qty;
      vAgg.productIds.add(productId);
      vAgg.orderIds.add(orderDoc.id);

      recent.push({
        orderId: orderDoc.id,
        invoiceNumber,
        productId,
        title,
        vendorId,
        vendorName,
        quantity: qty,
        price,
        lineTotal: price * qty,
        soldAt,
        customerName,
      });
    }
  }

  recent.sort((a, b) => b.soldAt - a.soldAt);

  const products: AdminSoldProductRow[] = [...byProduct.entries()]
    .map(([productId, row]) => {
      const v = vendorInfo.get(row.vendorId);
      return {
        productId,
        title: row.title,
        sku: row.sku,
        image: signedImages.get(productId) ?? "",
        vendorId: row.vendorId,
        vendorName: v?.name ?? row.vendorId,
        vendorEmail: v?.email ?? "",
        unitsSold: row.unitsSold,
        revenue: Math.round(row.revenue * 100) / 100,
        stockLeft: productMeta.get(productId)?.quantity ?? 0,
      };
    })
    .sort((a, b) => b.unitsSold - a.unitsSold);

  const vendors: AdminVendorSalesRow[] = [...byVendor.entries()]
    .map(([vendorId, row]) => {
      const v = vendorInfo.get(vendorId);
      return {
        vendorId,
        vendorName: v?.name ?? vendorId,
        vendorEmail: v?.email ?? "",
        unitsSold: row.unitsSold,
        revenue: Math.round(row.revenue * 100) / 100,
        productsSold: row.productIds.size,
        ordersWithSales: row.orderIds.size,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  const totalUnits = products.reduce((a, p) => a + p.unitsSold, 0);
  const totalRevenue =
    Math.round(products.reduce((a, p) => a + p.revenue, 0) * 100) / 100;

  return NextResponse.json({
    summary: {
      totalUnits,
      totalRevenue,
      productsSold: products.length,
      vendorsWithSales: vendors.length,
      ordersWithSales: new Set(recent.map((r) => r.orderId)).size,
    },
    vendors,
    products,
    recent: recent.slice(0, 100),
  });
}
