"use client";
import { useActionState } from "react";
import { removeFromWishlistAction } from "@/app/actions/wishlist";
import { addToCartAction } from "@/app/actions/cart";
import type { WishlistItemWithVendor } from "./page";

function WishlistCard({ item }: { item: WishlistItemWithVendor }) {
  const [removeState, removeAction, removePending] = useActionState(removeFromWishlistAction, undefined);
  const [cartState, cartAction, cartPending] = useActionState(addToCartAction, undefined);

  return (
    <div className="bg-white rounded-xl border border-ink/5 overflow-hidden group">
      {/* Image */}
      <div className="aspect-square overflow-hidden relative">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <form action={removeAction} className="absolute top-2 right-2">
          <input type="hidden" name="id" value={item.id} />
          <button
            type="submit"
            disabled={removePending}
            title="Remove from wishlist"
            className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-rose hover:bg-rose hover:text-white transition-colors shadow text-sm"
          >
            ✕
          </button>
        </form>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-ink/40 uppercase tracking-wider mb-1">{item.category}</p>
        <p className="font-heading text-cacao text-sm truncate">{item.name}</p>
        <p className="text-ink/60 text-sm mt-1 font-medium">₹{item.price.toLocaleString("en-IN")}</p>

        {/* Vendor info */}
        {item.vendorBrand && (
          <div className="mt-2 pt-2 border-t border-ink/5">
            <p className="text-[10px] text-ink/40 uppercase tracking-wider">
              by {item.vendorBrand}
            </p>
            {item.vendorCity && item.vendorState && (
              <p className="text-[10px] text-ink/30 mt-0.5">
                Ships from {item.vendorCity}, {item.vendorState}
              </p>
            )}
          </div>
        )}

        {/* Add to Cart */}
        <form action={cartAction} className="mt-3">
          <input type="hidden" name="productId" value={item.productId} />
          <input type="hidden" name="name" value={item.name} />
          <input type="hidden" name="image" value={item.image} />
          <input type="hidden" name="price" value={item.price} />
          <input type="hidden" name="category" value={item.category} />
          <button
            type="submit"
            disabled={cartPending}
            className="w-full bg-cacao text-white text-[10px] tracking-[0.15em] uppercase font-semibold py-2.5 rounded-sm hover:bg-sage transition-colors disabled:opacity-50"
          >
            {cartPending ? "Adding…" : cartState?.success ? "Added ✓" : "Add to Cart"}
          </button>
        </form>

        <p className="text-[10px] text-ink/30 mt-2 text-center">
          Added {new Date(item.addedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </p>
      </div>
    </div>
  );
}

export default function WishlistGrid({ items }: { items: WishlistItemWithVendor[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <WishlistCard key={item.id} item={item} />
      ))}
    </div>
  );
}
