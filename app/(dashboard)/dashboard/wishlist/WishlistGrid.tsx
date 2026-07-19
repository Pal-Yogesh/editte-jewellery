"use client";
import { useActionState } from "react";
import { removeFromWishlistAction } from "@/app/actions/wishlist";
import type { WishlistItem } from "@/lib/types";

function WishlistCard({ item }: { item: WishlistItem }) {
  const [state, action, pending] = useActionState(removeFromWishlistAction, undefined);
  return (
    <div className="bg-white rounded-xl border border-ink/5 overflow-hidden group">
      <div className="aspect-square overflow-hidden relative">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <form action={action} className="absolute top-2 right-2">
          <input type="hidden" name="id" value={item.id} />
          <button
            type="submit"
            disabled={pending}
            title="Remove from wishlist"
            className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-rose hover:bg-rose hover:text-white transition-colors shadow text-sm"
          >
            ✕
          </button>
        </form>
      </div>
      <div className="p-4">
        <p className="text-xs text-ink/40 uppercase tracking-wider mb-1">{item.category}</p>
        <p className="font-heading text-cacao text-sm truncate">{item.name}</p>
        <p className="text-ink/60 text-sm mt-1 font-medium">₹{item.price.toLocaleString("en-IN")}</p>
        <p className="text-xs text-ink/30 mt-1">
          Added {new Date(item.addedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </p>
      </div>
    </div>
  );
}

export default function WishlistGrid({ items }: { items: WishlistItem[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <WishlistCard key={item.id} item={item} />
      ))}
    </div>
  );
}
