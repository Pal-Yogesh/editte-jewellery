"use client";
import { useRef, useActionState } from "react";
import { addToCartAction } from "@/app/actions/cart";
import { addToWishlistAction } from "@/app/actions/wishlist";
import type { NewArrivalItem } from "@/lib/types";
import Link from "next/link";

function ArrivalCard({ product, isLoggedIn }: { product: NewArrivalItem; isLoggedIn: boolean }) {
  const [cartState, cartAction, cartPending] = useActionState(addToCartAction, undefined);
  const [wishState, wishAction, wishPending] = useActionState(addToWishlistAction, undefined);
  const inCart = cartState?.success;
  const inWish = wishState?.success;

  return (
    <div className=" w-60 group cursor-pointer">
      <div className="bg-white w-52 shadow-sm overflow-hidden p-3">
        {/* Image with heart on top-right */}
        <div className="relative w-full h-36  overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
          {/* Heart — top right of image */}
          {isLoggedIn ? (
            <form action={wishAction} className="absolute top-2 right-2 z-10">
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="name" value={product.name} />
              <input type="hidden" name="image" value={product.image} />
              <input type="hidden" name="price" value={product.price} />
              <input type="hidden" name="category" value={product.category} />
              <button type="submit" disabled={wishPending} title={inWish ? "Saved" : "Save to wishlist"}
                className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors
                  ${inWish ? "bg-rose text-white" : "bg-white/90 text-ink/30 hover:text-rose"}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill={inWish ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </form>
          ) : (
            <Link href="/auth/login" title="Sign in to save"
              className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-ink/30 hover:text-rose shadow-sm transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </Link>
          )}
        </div>
      </div>

      {/* Below the image box: name+price left, cart button right */}
      <div className="w-52 mt-3 flex items-end justify-between gap-2">
        <div>
          <p className="text-ink text-sm font-medium">{product.name}</p>
          <p className="font-numeric text-cacao/60 text-xs mt-0.5">₹ {product.price.toLocaleString("en-IN")}</p>
        </div>

        {/* Cart only — heart moved to image */}
        {isLoggedIn ? (
          <form action={cartAction}>
            <input type="hidden" name="productId" value={product.id} />
            <input type="hidden" name="name" value={product.name} />
            <input type="hidden" name="image" value={product.image} />
            <input type="hidden" name="price" value={product.price} />
            <input type="hidden" name="category" value={product.category} />
            <button type="submit" disabled={cartPending || inCart} title={inCart ? "In cart" : "Add to cart"}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] tracking-wide transition-all duration-300
                ${inCart ? "bg-sage text-white cursor-default" : "bg-ink/8 text-ink/50 hover:bg-cacao hover:text-white"}`}>
              {inCart ? (
                <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>Added</>
              ) : cartPending ? (
                <svg className="animate-spin" width="11" height="11" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
              ) : (
                <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>Add</>
              )}
            </button>
          </form>
        ) : (
          <Link href="/auth/login"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] tracking-wide bg-ink/8 text-ink/50 hover:bg-cacao hover:text-white transition-all duration-300">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>Add
          </Link>
        )}
      </div>
    </div>
  );
}

interface Props { items: NewArrivalItem[]; isLoggedIn: boolean; }

export default function NewArrivalsScroller({ items, isLoggedIn }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") =>
    scrollRef.current?.scrollBy({ left: dir === "right" ? 220 : -220, behavior: "smooth" });

  return (
    <div className="flex items-center gap-3">
      {/* Left arrow — line with arrowhead ← */}
      <button onClick={() => scroll("left")} aria-label="Scroll left"
        className="shrink-0 text-cacao/60 hover:text-cacao transition-colors">
        <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </button>
      <div ref={scrollRef} className="flex gap-10 overflow-x-auto overflow-y-hidden hide-scrollbar pb-2 scroll-smooth flex-1">
        {items.map((p) => <ArrivalCard key={p.id} product={p} isLoggedIn={isLoggedIn} />)}
      </div>
      {/* Right arrow — line with arrowhead → */}
      <button onClick={() => scroll("right")} aria-label="Scroll right"
        className="shrink-0 text-cacao/60 hover:text-cacao transition-colors">
        <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
    </div>
  );
}
