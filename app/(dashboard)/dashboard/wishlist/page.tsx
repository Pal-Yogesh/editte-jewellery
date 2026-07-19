import { verifySession } from "@/lib/dal";
import { adminDb } from "@/lib/firebase/admin";
import type { WishlistItem } from "@/lib/types";
import { PRODUCTS } from "@/lib/types";
import Link from "next/link";
import WishlistGrid from "./WishlistGrid";

async function getWishlist(uid: string): Promise<WishlistItem[]> {
  const snap = await adminDb
    .collection("wishlist")
    .doc(uid)
    .collection("items")
    .orderBy("addedAt", "desc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WishlistItem, "id">) }));
}

export default async function WishlistPage() {
  const session = await verifySession();
  const items = await getWishlist(session.uid);

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
        <WishlistGrid items={items} />
      )}

     
    </div>
  );
}
