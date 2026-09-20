"use client";
import { useActionState } from "react";
import { addToCartAction } from "@/app/actions/cart";
import { addToWishlistAction } from "@/app/actions/wishlist";
import type { Product } from "@/lib/types";
import Link from "next/link";

interface Props {
  product: Product;
  isLoggedIn: boolean;
}

export default function ProductCard({ product, isLoggedIn }: Props) {
  const [cartState, cartAction, cartPending] = useActionState(addToCartAction, undefined);
  const [wishState, wishAction, wishPending] = useActionState(addToWishlistAction, undefined);

  const added = cartState?.success;
  const wished = wishState?.success;

  return (
    <div className="shrink-0 w-64 group cursor-pointer">
      <div className="bg-white shadow-sm overflow-hidden">
        {/* Image */}
        <div className="relative w-full h-64 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Wishlist heart — top right */}
          {isLoggedIn ? (
            <form
              action={wishAction}
              className="absolute top-2 right-2 z-10"
            >
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="name" value={product.name} />
              <input type="hidden" name="image" value={product.image} />
              <input type="hidden" name="price" value={product.price} />
              <input type="hidden" name="category" value={product.category} />
              <button
                type="submit"
                disabled={wishPending}
                title={wished ? "In wishlist" : "Save to wishlist"}
                className={`w-8 h-8 rounded-full flex items-center justify-center shadow transition-colors
                  ${wished ? "bg-white text-ruby" : "bg-white/90 text-ink hover:text-ruby"}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill={wished ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </form>
          ) : (
            <Link
              href="/auth/login"
              title="Sign in to save"
              className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-ink hover:text-ruby shadow transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </Link>
          )}
        </div>

        {/* Info + Add to Cart */}
        <div className="p-3">
          <p className="text-xs text-ink/40 uppercase tracking-wider mb-0.5">{product.category}</p>
          <p className="text-ink text-sm font-heading">{product.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-cacao text-sm">₹{product.price.toLocaleString("en-IN")}</p>
            {product.originalPrice && (
              <p className="text-ink/30 text-xs line-through">
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </p>
            )}
          </div>

          {isLoggedIn ? (
            <form action={cartAction} className="mt-3">
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="name" value={product.name} />
              <input type="hidden" name="image" value={product.image} />
              <input type="hidden" name="price" value={product.price} />
              <input type="hidden" name="category" value={product.category} />
              <button
                type="submit"
                disabled={cartPending}
                className={`w-full py-2 text-xs tracking-[0.15em] uppercase transition-colors duration-300
                  ${added
                    ? "bg-sage text-white"
                    : "bg-cacao text-white hover:bg-sage"
                  } disabled:opacity-50`}
              >
                {cartPending ? "Adding…" : added ? "Added ✓" : "Add to Cart"}
              </button>
            </form>
          ) : (
            <Link
              href="/auth/login"
              className="mt-3 block w-full py-2 text-xs tracking-[0.15em] uppercase text-center bg-cacao text-white hover:bg-sage transition-colors duration-300"
            >
              Add to Cart
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
