import { verifySession } from "@/lib/dal";
import { adminDb } from "@/lib/firebase/admin";
import type { WishlistItem } from "@/lib/types";
import { getApprovedProducts } from "@/lib/products";
import Link from "next/link";
import WishlistGrid from "./WishlistGrid";
import ProductsGrid from "./ProductsGrid";

export interface WishlistItemWithVendor extends WishlistItem {
  vendorBrand: string;
  vendorCity: string;
  vendorState: string;
  productId: string;
}

async function getWishlist(uid: string): Promise<WishlistItem[]> {
  const snap = await adminDb
    .collection("wishlist")
    .doc(uid)
    .collection("items")
    .orderBy("addedAt", "desc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WishlistItem, "id">) }));
}

async function enrichWithVendorInfo(items: WishlistItem[]): Promise<WishlistItemWithVendor[]> {
  if (items.length === 0) return [];

  // Fetch all product docs to get vendorIds
  const productIds = items.map((i) => i.productId);
  const productSnaps = await Promise.all(
    productIds.map((pid) => adminDb.collection("products").doc(pid).get())
  );

  // Collect unique vendor IDs
  const vendorIdMap: Record<string, string> = {};
  productSnaps.forEach((snap, i) => {
    if (snap.exists) {
      vendorIdMap[productIds[i]] = (snap.data()?.vendorId as string) ?? "";
    }
  });

  const uniqueVendorIds = [...new Set(Object.values(vendorIdMap).filter(Boolean))];

  // Fetch all vendor docs at once
  const vendorInfoMap: Record<string, { brand: string; city: string; state: string }> = {};
  if (uniqueVendorIds.length > 0) {
    const vendorSnaps = await Promise.all(
      uniqueVendorIds.map((vid) => adminDb.collection("vendors").doc(vid).get())
    );
    vendorSnaps.forEach((snap) => {
      if (snap.exists) {
        const data = snap.data()!;
        const profile = data.profile ?? {};
        const pickup = data.pickupAddress ?? {};
        vendorInfoMap[snap.id] = {
          brand: (profile.brandName as string) ?? "",
          city: (pickup.city as string) ?? "",
          state: (pickup.state as string) ?? "",
        };
      }
    });
  }

  return items.map((item) => {
    const vendorId = vendorIdMap[item.productId] ?? "";
    const vendor = vendorInfoMap[vendorId];
    return {
      ...item,
      vendorBrand: vendor?.brand ?? "",
      vendorCity: vendor?.city ?? "",
      vendorState: vendor?.state ?? "",
    };
  });
}

export default async function WishlistPage() {
  const session = await verifySession();
  const [items, approvedProducts] = await Promise.all([
    getWishlist(session.uid),
    getApprovedProducts(),
  ]);

  const enrichedItems = await enrichWithVendorInfo(items);

  // Track which product IDs are already in the user's wishlist
  const wishlistProductIds = items.map((i) => i.productId);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-cacao text-3xl">Wishlist</h1>
        <span className="text-ink/40 text-sm">{items.length} item{items.length !== 1 ? "s" : ""}</span>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-ink/5 px-6 py-16 text-center">
          <p className="text-4xl mb-4">♡</p>
          <p className="font-heading text-cacao text-lg">Your wishlist is empty</p>
          <p className="text-ink/40 text-sm mt-2 mb-6">Save items you love and come back to them later</p>
          <Link href="/" className="inline-block bg-cacao text-white text-xs tracking-[0.15em] uppercase px-8 py-3 hover:bg-sage transition-colors">
            Browse Collections
          </Link>
        </div>
      ) : (
        <WishlistGrid items={enrichedItems} />
      )}

      {/* All approved products for discovery */}
      {approvedProducts.length > 0 && (
        <section className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-cacao text-xl">Explore Collections</h2>
            <span className="text-ink/40 text-xs">{approvedProducts.length} product{approvedProducts.length !== 1 ? "s" : ""}</span>
          </div>
          <ProductsGrid products={approvedProducts} wishlistProductIds={wishlistProductIds} />
        </section>
      )}
    </div>
  );
}
