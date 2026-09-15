"use client";
import { useState, useMemo, useRef, useEffect, useActionState } from "react";
import { addToCartAction } from "@/app/actions/cart";
import { addToWishlistAction } from "@/app/actions/wishlist";
import type { CategoryProduct } from "@/lib/categoryProducts";
import type { FilterState } from "./CategoryFilters";
import Link from "next/link";

type GridCols = 2 | 3 | 4;

const SORT_OPTIONS = [
  { value: "", label: "Sort By" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "A to Z" },
  { value: "name-desc", label: "Z to A" },
];

const PRICE_FILTER_OPTIONS = [
  { value: "under-2000", label: "Under 2K", max: 2000 },
  { value: "under-5000", label: "Under 5K", max: 5000 },
  { value: "under-10000", label: "Under 10K", max: 10000 },
  { value: "above-10000", label: "Above 10K", max: Infinity },
] as const;

function ShopByPrice({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickAway(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickAway);
    return () => document.removeEventListener("mousedown", onClickAway);
  }, []);

  const activeLabel = PRICE_FILTER_OPTIONS.find((o) => o.value === value)?.label;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 text-sm text-cacao font-heading outline-none cursor-pointer"
      >
        {activeLabel ?? "Shop by Price"}
        <span className={`text-[10px] text-ink/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-2 w-40 bg-white shadow-lg border border-ink/10 py-2 z-20">
          {PRICE_FILTER_OPTIONS.slice(0, 3).map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(value === o.value ? "" : o.value); setOpen(false); }}
              className={`block w-full text-left px-4 py-1.5 text-sm transition-colors ${
                value === o.value ? "text-cacao font-medium" : "text-ink/60 hover:text-cacao"
              }`}
            >
              {o.label}
            </button>
          ))}
          <div className="my-2 border-t border-ink/10" />
          {PRICE_FILTER_OPTIONS.slice(3).map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(value === o.value ? "" : o.value); setOpen(false); }}
              className={`block w-full text-left px-4 py-1.5 text-sm transition-colors ${
                value === o.value ? "text-cacao font-medium" : "text-ink/60 hover:text-cacao"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* Hover reveal: hidden + nudged on desktop, always visible on touch screens */
const REVEAL =
  "transition-all duration-300 ease-out md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100";

function ProductCard({ product, isLoggedIn }: { product: CategoryProduct; isLoggedIn: boolean }) {
  const [cartState, cartAction, cartPending] = useActionState(addToCartAction, undefined);
  const [wishState, wishAction, wishPending] = useActionState(addToWishlistAction, undefined);
  const inCart = cartState?.success;
  const inWish = wishState?.success;

  const hiddenFields = (
    <>
      <input type="hidden" name="productId" value={product.id} />
      <input type="hidden" name="name" value={product.name} />
      <input type="hidden" name="image" value={product.image} />
      <input type="hidden" name="price" value={product.price} />
      <input type="hidden" name="category" value={product.category} />
    </>
  );

  return (
    <div className="group cursor-pointer">
      {/* Image with heart top-right + add-to-cart sliding up from the bottom, both revealed on hover */}
      <div className="aspect-[3/4] overflow-hidden bg-sand/20 relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Wishlist heart */}
        <div className={`absolute top-3 right-3 z-10 md:-translate-y-1 md:group-hover:translate-y-0 md:focus-within:translate-y-0 ${REVEAL}`}>
          {isLoggedIn ? (
            <form action={wishAction}>
              {hiddenFields}
              <button type="submit" disabled={wishPending} title={inWish ? "Saved" : "Save to wishlist"}
                className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors
                  ${inWish ? "bg-white text-ruby" : "bg-white/90 text-ink/30 hover:text-ruby"}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill={inWish ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </form>
          ) : (
            <Link href="/auth/login" title="Sign in to save"
              className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-ink/30 hover:text-ruby shadow-sm transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </Link>
          )}
        </div>

        {/* Add to cart — slides up from the bottom of the image on hover */}
        <div className={`absolute inset-x-0 bottom-0 z-10 flex justify-center px-2 pb-2 md:translate-y-2 md:group-hover:translate-y-0 md:focus-within:translate-y-0 ${REVEAL}`}>
          {isLoggedIn ? (
            <form action={cartAction}>
              {hiddenFields}
              <button type="submit" disabled={cartPending || inCart} title={inCart ? "In cart" : "Add to cart"}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] uppercase tracking-[0.12em] shadow-sm transition-colors duration-300
                  ${inCart ? "bg-sage text-white cursor-default" : "bg-cacao text-white hover:bg-sage"} disabled:opacity-90`}>
                {inCart ? (
                  <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>Added</>
                ) : cartPending ? (
                  <><svg className="animate-spin" width="11" height="11" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Adding</>
                ) : (
                  <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>Add to cart</>
                )}
              </button>
            </form>
          ) : (
            <Link href="/auth/login"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[10px] uppercase tracking-[0.12em] shadow-sm bg-sage text-white hover:bg-cacao transition-colors duration-300">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>Add to cart
            </Link>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="pt-4 pb-2">
        <p className="text-[10px] tracking-[0.2em] uppercase text-ink/40 mb-1">
          {product.designer}
        </p>
        <p className="font-heading text-cacao text-[0.95rem] leading-snug">
          {product.name}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[0.95rem] text-cacao font-numeric">
            ₹ {product.price.toLocaleString("en-IN")}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-ink/30 line-through font-numeric">
              ₹ {product.originalPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface Props {
  products: CategoryProduct[];
  filters: FilterState;
  isLoggedIn: boolean;
}

export default function CategoryProductGrid({ products, filters, isLoggedIn }: Props) {
  const [gridCols, setGridCols] = useState<GridCols>(3);
  const [sort, setSort] = useState("");
  const [priceFilter, setPriceFilter] = useState("");

  const filtered = useMemo(() => {
    const priceOption = PRICE_FILTER_OPTIONS.find((o) => o.value === priceFilter);
    const priceFloor = priceFilter === "above-10000" ? 10000 : 0;

    let result = products.filter((p) => {
      if (p.price < filters.minPrice || p.price > filters.maxPrice) return false;
      if (filters.productTypes.length > 0 && !filters.productTypes.includes(p.productType)) return false;
      if (filters.designers.length > 0 && !filters.designers.includes(p.designer)) return false;
      if (filters.colours.length > 0 && !filters.colours.includes(p.colour)) return false;
      if (filters.materials.length > 0 && !filters.materials.includes(p.material)) return false;
      // A product matches if it stocks any of the selected sizes.
      if (filters.sizes.length > 0 && !p.sizes.some((s) => filters.sizes.includes(s))) return false;
      if (priceOption && (p.price <= priceFloor || p.price > priceOption.max)) return false;
      return true;
    });

    switch (sort) {
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result = [...result].sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    return result;
  }, [products, filters, sort, priceFilter]);

  const gridClass =
    gridCols === 2
      ? "grid-cols-1 sm:grid-cols-2 gap-8"
      : gridCols === 3
        ? "grid-cols-2 sm:grid-cols-3 gap-6"
        : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5";

  return (
    <div className="flex-1 min-w-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-ink/10">
        <div className="flex items-center gap-3">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-transparent text-sm text-cacao font-heading outline-none cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <span className="text-ink/15">|</span>
          <ShopByPrice value={priceFilter} onChange={setPriceFilter} />
          <span className="text-[10px] text-ink/30 tracking-wider uppercase">
            {filtered.length} product{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1">
          {([2, 3, 4] as GridCols[]).map((cols) => (
            <button
              key={cols}
              onClick={() => setGridCols(cols)}
              className={`w-9 h-9 flex items-center justify-center gap-[2px] rounded-sm transition-colors ${
                gridCols === cols ? "bg-cacao" : "bg-transparent hover:bg-ink/5"
              }`}
              aria-label={`${cols} columns`}
            >
              {Array.from({ length: cols }).map((_, i) => (
                <span key={i} className={`block w-[3px] h-4 rounded-[1px] ${gridCols === cols ? "bg-white" : "bg-ink/20"}`} />
              ))}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-4xl mb-4">✦</p>
          <p className="font-heading text-cacao text-xl">No products found</p>
          <p className="text-ink/40 text-sm mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className={`grid ${gridClass}`}>
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} isLoggedIn={isLoggedIn} />
          ))}
        </div>
      )}
    </div>
  );
}
