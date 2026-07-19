"use client";
import { useActionState } from "react";
import { updateCartQuantityAction, removeFromCartAction } from "@/app/actions/cart";
import type { CartItem } from "@/lib/types";

function CartRow({ item }: { item: CartItem }) {
  const [removeState, removeAction, removePending] = useActionState(removeFromCartAction, undefined);
  const [qtyState, qtyAction, qtyPending] = useActionState(updateCartQuantityAction, undefined);

  return (
    <div className="flex gap-4 py-5 border-b border-ink/5 last:border-0">
      <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-ink/5">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-ink/40 uppercase tracking-wider">{item.category}</p>
        <p className="font-heading text-cacao text-sm mt-0.5 truncate">{item.name}</p>
        <p className="text-ink/60 text-sm mt-1">₹{item.price.toLocaleString("en-IN")}</p>

        {/* Quantity controls */}
        <div className="flex items-center gap-3 mt-3">
          <form action={qtyAction} className="flex items-center border border-ink/20 rounded">
            <input type="hidden" name="id" value={item.id} />
            <button
              type="submit"
              name="quantity"
              value={Math.max(1, item.quantity - 1)}
              disabled={qtyPending || item.quantity <= 1}
              className="px-3 py-1.5 text-sm text-ink/50 hover:text-cacao disabled:opacity-30 transition-colors"
            >
              −
            </button>
            <span className="px-3 text-sm font-heading text-cacao min-w-[2rem] text-center">
              {item.quantity}
            </span>
            <button
              type="submit"
              name="quantity"
              value={Math.min(20, item.quantity + 1)}
              disabled={qtyPending || item.quantity >= 20}
              className="px-3 py-1.5 text-sm text-ink/50 hover:text-cacao disabled:opacity-30 transition-colors"
            >
              +
            </button>
          </form>

          <form action={removeAction}>
            <input type="hidden" name="id" value={item.id} />
            <button type="submit" disabled={removePending} className="text-xs text-rose hover:text-rose/70 underline transition-colors disabled:opacity-50">
              {removePending ? "Removing…" : "Remove"}
            </button>
          </form>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-heading text-cacao text-sm">
          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
        </p>
      </div>
    </div>
  );
}

export default function CartClient({ items }: { items: CartItem[] }) {
  return (
    <div className="bg-white rounded-xl border border-ink/5 px-5 divide-y divide-ink/5">
      {items.map((item) => (
        <CartRow key={item.id} item={item} />
      ))}
    </div>
  );
}
