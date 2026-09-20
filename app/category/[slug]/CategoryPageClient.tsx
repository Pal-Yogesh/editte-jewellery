"use client";
import { useState } from "react";
import CategoryFilters, { type FilterState } from "@/components/category/CategoryFilters";
import CategoryProductGrid from "@/components/category/CategoryProductGrid";
import type { CategoryProduct } from "@/lib/categoryProducts";

interface Props {
  products: CategoryProduct[];
  productTypes: string[];
  designers: string[];
  colours: string[];
  materials: string[];
  sizes: string[];
  priceRange: [number, number];
  isLoggedIn: boolean;
  showViewAll: boolean;
}

export default function CategoryPageClient({
  products,
  productTypes,
  designers,
  colours,
  materials,
  sizes,
  priceRange,
  isLoggedIn,
  showViewAll,
}: Props) {
  const [filters, setFilters] = useState<FilterState>({
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    productTypes: [],
    designers: [],
    colours: [],
    materials: [],
    sizes: [],
    sort: "featured",
  });

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filterProps = {
    productTypes,
    designers,
    colours,
    materials,
    sizes,
    priceRange,
    showViewAll,
  };

  return (
    <div className="flex gap-10 items-start">
      {/* Desktop sidebar filters */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-24">
        <CategoryFilters {...filterProps} onFilter={setFilters} />
      </aside>

      {/* Mobile filter toggle */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="bg-cacao text-white text-xs tracking-[0.15em] uppercase px-6 py-3 rounded-full shadow-lg hover:bg-sage transition-colors"
        >
          Filters
        </button>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-cacao/30 lg:hidden"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-80 bg-salt z-50 lg:hidden overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="font-heading text-cacao text-lg">Filters</span>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="text-ink/40 hover:text-cacao text-lg"
              >
                ✕
              </button>
            </div>
            <CategoryFilters
              {...filterProps}
              onFilter={(f) => {
                setFilters(f);
                setMobileFiltersOpen(false);
              }}
            />
          </div>
        </>
      )}

      {/* Product grid */}
      <CategoryProductGrid products={products} filters={filters} isLoggedIn={isLoggedIn} />
    </div>
  );
}
