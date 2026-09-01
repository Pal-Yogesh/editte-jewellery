"use client";
import { useState, useMemo } from "react";
import type { CategoryProduct } from "@/lib/categoryProducts";
import type { FilterState } from "./CategoryFilters";

type GridCols = 2 | 3 | 4;

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
];

function ProductCard({ product }: { product: CategoryProduct }) {
  return (
    <div className="group cursor-pointer">
      {/* Image — tall portrait like the screenshot */}
      <div className="aspect-[3/4] overflow-hidden bg-sand/20">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {/* Info — designer small caps, name, price */}
      <div className="pt-4 pb-2">
        <p className="text-[10px] tracking-[0.2em] uppercase text-ink/40 mb-1">
          {product.designer}
        </p>
        <p className="font-heading text-cacao text-[0.95rem] leading-snug">
          {product.name}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[0.95rem] text-cacao">
            ₹ {product.price.toLocaleString("en-IN")}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-ink/30 line-through">
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
}

export default function CategoryProductGrid({ products, filters }: Props) {
  const [gridCols, setGridCols] = useState<GridCols>(3);
  const [sort, setSort] = useState("featured");

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      if (p.price < filters.minPrice || p.price > filters.maxPrice) return false;
      if (filters.productTypes.length > 0 && !filters.productTypes.includes(p.productType)) return false;
      if (filters.designers.length > 0 && !filters.designers.includes(p.designer)) return false;
      return true;
    });

    switch (sort) {
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result = [...result].reverse();
        break;
    }

    return result;
  }, [products, filters, sort]);

  const gridClass =
    gridCols === 2
      ? "grid-cols-1 sm:grid-cols-2 gap-8"
      : gridCols === 3
        ? "grid-cols-2 sm:grid-cols-3 gap-6"
        : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5";

  return (
    <div className="flex-1 min-w-0">
      {/* Toolbar — sort + grid toggle */}
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
          <span className="text-[10px] text-ink/30 tracking-wider uppercase">
            {filtered.length} item{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Grid toggle icons */}
        <div className="hidden sm:flex items-center gap-1">
          {([2, 3, 4] as GridCols[]).map((cols) => (
            <button
              key={cols}
              onClick={() => setGridCols(cols)}
              className={`w-9 h-9 flex items-center justify-center gap-[2px] rounded-sm transition-colors ${
                gridCols === cols
                  ? "bg-cacao"
                  : "bg-transparent hover:bg-ink/5"
              }`}
              aria-label={`${cols} columns`}
            >
              {Array.from({ length: cols }).map((_, i) => (
                <span
                  key={i}
                  className={`block w-[3px] h-4 rounded-[1px] ${
                    gridCols === cols ? "bg-white" : "bg-ink/20"
                  }`}
                />
              ))}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-4xl mb-4">✦</p>
          <p className="font-heading text-cacao text-xl">No products found</p>
          <p className="text-ink/40 text-sm mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className={`grid ${gridClass}`}>
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
