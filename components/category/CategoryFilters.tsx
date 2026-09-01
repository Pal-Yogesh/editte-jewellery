"use client";
import { useState } from "react";

interface Props {
  productTypes: string[];
  designers: string[];
  priceRange: [number, number];
  onFilter: (filters: FilterState) => void;
}

export interface FilterState {
  minPrice: number;
  maxPrice: number;
  productTypes: string[];
  designers: string[];
  sort: string;
}

function FilterSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-ink/10 py-5">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="font-heading text-cacao text-[0.95rem]">{title}</span>
        <span className="text-ink/25 text-sm transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}>
          ▾
        </span>
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

export default function CategoryFilters({ productTypes, designers, priceRange, onFilter }: Props) {
  const [minPrice, setMinPrice] = useState(priceRange[0]);
  const [maxPrice, setMaxPrice] = useState(priceRange[1]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedDesigners, setSelectedDesigners] = useState<string[]>([]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ price: true, productType: false, designer: false });

  function toggle(s: string) { setOpenSections((p) => ({ ...p, [s]: !p[s] })); }
  function toggleItem(list: string[], item: string) { return list.includes(item) ? list.filter((i) => i !== item) : [...list, item]; }

  function applyFilters() {
    onFilter({ minPrice, maxPrice, productTypes: selectedTypes, designers: selectedDesigners, sort: "featured" });
  }
  function clearAll() {
    setMinPrice(priceRange[0]);
    setMaxPrice(priceRange[1]);
    setSelectedTypes([]);
    setSelectedDesigners([]);
    onFilter({ minPrice: priceRange[0], maxPrice: priceRange[1], productTypes: [], designers: [], sort: "featured" });
  }

  return (
    <div className="w-full">
      <h2 className="font-heading text-cacao text-2xl mb-2" style={{ fontStyle: "italic" }}>Filters</h2>

      {/* Price */}
      <FilterSection title="Price" open={openSections.price} onToggle={() => toggle("price")}>
        <div className="flex flex-col gap-4">
          {/* Dual dots slider track */}
          <div className="relative h-1 bg-ink/10 rounded-full">
            <div
              className="absolute h-1 bg-cacao rounded-full"
              style={{
                left: `${((minPrice - priceRange[0]) / (priceRange[1] - priceRange[0])) * 100}%`,
                right: `${100 - ((maxPrice - priceRange[0]) / (priceRange[1] - priceRange[0])) * 100}%`,
              }}
            />
            <input
              type="range" min={priceRange[0]} max={priceRange[1]} value={minPrice}
              onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice - 100))}
              className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cacao [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <input
              type="range" min={priceRange[0]} max={priceRange[1]} value={maxPrice}
              onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice + 100))}
              className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cacao [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center border border-ink/15 rounded px-2.5 py-2 flex-1 bg-white">
              <span className="text-ink/35 mr-1">₹</span>
              <input type="number" value={minPrice} onChange={(e) => setMinPrice(Number(e.target.value))} className="w-full bg-transparent outline-none text-sm text-cacao" />
            </div>
            <span className="text-ink/25 text-xs font-heading">To</span>
            <div className="flex items-center border border-ink/15 rounded px-2.5 py-2 flex-1 bg-white">
              <span className="text-ink/35 mr-1">₹</span>
              <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full bg-transparent outline-none text-sm text-cacao" />
            </div>
          </div>
        </div>
      </FilterSection>

      {/* Product Type */}
      <FilterSection title="Product Type" open={openSections.productType} onToggle={() => toggle("productType")}>
        <div className="flex flex-col gap-2.5">
          {productTypes.map((type) => (
            <label key={type} className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" checked={selectedTypes.includes(type)} onChange={() => setSelectedTypes((p) => toggleItem(p, type))} className="accent-sage w-4 h-4 rounded" />
              <span className="text-sm text-ink/60 group-hover:text-cacao transition-colors">{type}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Designer */}
      <FilterSection title="Designer" open={openSections.designer} onToggle={() => toggle("designer")}>
        <div className="flex flex-col gap-2.5">
          {designers.map((d) => (
            <label key={d} className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" checked={selectedDesigners.includes(d)} onChange={() => setSelectedDesigners((p) => toggleItem(p, d))} className="accent-sage w-4 h-4 rounded" />
              <span className="text-sm text-ink/60 group-hover:text-cacao transition-colors">{d}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Actions */}
      <div className="flex gap-3 mt-8">
        <button onClick={clearAll} className="flex-1 bg-cacao text-white text-[11px] tracking-[0.18em] uppercase py-3 hover:bg-ink transition-colors">
          Clear All
        </button>
        <button onClick={applyFilters} className="flex-1 bg-cacao text-white text-[11px] tracking-[0.18em] uppercase py-3 hover:bg-sage transition-colors">
          Apply Filters
        </button>
      </div>
    </div>
  );
}
