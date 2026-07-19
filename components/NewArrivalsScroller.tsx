"use client";
import { useRef, useActionState } from "react";
import { addToCartAction } from "@/app/actions/cart";
import { addToWishlistAction } from "@/app/actions/wishlist";
import Link from "next/link";

// Original images + data matching the screenshot
const ARRIVALS = [
  { id: "a1", name: "Ring", price: 3000, image: "/images/products/NECK%20PIECES.png", category: "Neckpieces" },
  { id: "a2", name: "Ring", price: 3000, image: "/images/products/RING.png", category: "Rings" },
  { id: "a3", name: "Ring", price: 3000, image: "/images/products/BANGLES.png", category: "Bangles" },
  { id: "a4", name: "Ring", price: 3000, image: "/images/products/EARRINGS.png", category: "Earrings" },
  { id: "a5", name: "Ring", price: 3000, image: "/images/products/NECK%20PIECES.png", category: "Neckpieces" },
  { id: "a6", name: "Ring", price: 3000, image: "/images/products/RING.png", category: "Rings" },
  { id: "a7", name: "Ring", price: 3000, image: "/images/products/EARRINGS.png", category: "Earrings" },
  { id: "a8", name: "Ring", price: 3000, image: "/images/products/BANGLES.png", category: "Bangles" },
];

function ArrivalCard({
  product,
  isLoggedIn,
}: {
  product: (typeof ARRIVALS)[0];
  isLoggedIn: boolean;
}) {
  const [cartState, cartAction, cartPending] = useActionState(addToCartAction, undefined);
  const [wishState, wishAction, wishPending] = useActionState(addToWishlistAction, undefined);

  const inCart = cartState?.success;
  const inWish = wishState?.success;

  return (
    <div className="shrink-0 w-80 group cursor-pointer">
      <div className="bg-white shadow-sm overflow-hidden p-4">
        {/* Image */}
        <div className="relative w-full h-64">
          <img
            src={product.image}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Bottom row: name+price left, icons right */}
        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <p className="text-ink text-sm font-medium">{product.name}</p>
            <p className="text-cacao/60 text-xs mt-0.5">
              ₹ {product.price.toLocaleString("en-IN")}
            </p>
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Wishlist */}
            {isLoggedIn ? (
              <form action={wishAction}>
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="name" value={product.name} />
                <input type="hidden" name="image" value={product.image} />
                <input type="hidden" name="price" value={product.price} />
                <input type="hidden" name="category" value={product.category} />
                <button
                  type="submit"
                  disabled={wishPending}
                  title={inWish ? "Saved" : "Save to wishlist"}
                  className={`w-7 h-7 flex items-center justify-center transition-colors
                    ${inWish ? "text-rose" : "text-ink/30 hover:text-rose"}`}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill={inWish ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </form>
            ) : (
              <Link href="/auth/login" title="Sign in to save" className="w-7 h-7 flex items-center justify-center text-ink/30 hover:text-rose transition-colors">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </Link>
            )}

            {/* Cart */}
            {isLoggedIn ? (
              <form action={cartAction}>
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="name" value={product.name} />
                <input type="hidden" name="image" value={product.image} />
                <input type="hidden" name="price" value={product.price} />
                <input type="hidden" name="category" value={product.category} />
                <button
                  type="submit"
                  disabled={cartPending || inCart}
                  title={inCart ? "In cart" : "Add to cart"}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] tracking-wide transition-all duration-300
                    ${inCart
                      ? "bg-sage text-white cursor-default"
                      : "bg-ink/8 text-ink/50 hover:bg-cacao hover:text-white"
                    }`}
                >
                  {inCart ? (
                    <>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Added
                    </>
                  ) : cartPending ? (
                    <svg className="animate-spin" width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                  ) : (
                    <>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                      </svg>
                      Add
                    </>
                  )}
                </button>
              </form>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] tracking-wide bg-ink/8 text-ink/50 hover:bg-cacao hover:text-white transition-all duration-300"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                Add
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface Props {
  isLoggedIn: boolean;
}

export default function NewArrivalsScroller({ isLoggedIn }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "right" ? 220 : -220, behavior: "smooth" });
  };

  return (
    <div className="flex items-center gap-3">
      {/* Left arrow — outside the scroll area */}
      <button
        onClick={() => scroll("left")}
        aria-label="Scroll left"
        className="shrink-0 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-cacao hover:bg-cacao hover:text-white transition-colors"
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Scrollable cards */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto overflow-y-hidden hide-scrollbar pb-2 scroll-smooth flex-1"
      >
        {ARRIVALS.map((p) => (
          <ArrivalCard key={p.id} product={p} isLoggedIn={isLoggedIn} />
        ))}
      </div>

      {/* Right arrow — outside the scroll area */}
      <button
        onClick={() => scroll("right")}
        aria-label="Scroll right"
        className="shrink-0 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-cacao hover:bg-cacao hover:text-white transition-colors"
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
