"use client";
import { useState } from "react";
import Link from "next/link";
import { ALL_PRODUCTS_SLUG, COLOUR_SWATCHES } from "@/lib/categoryProducts";

interface Props {
  productTypes: string[];
  designers: string[];
  colours: string[];
  materials: string[];
  sizes: string[];
  priceRange: [number, number];
  onFilter: (filters: FilterState) => void;
  /** Hide the "View All Products" rail link when already on the all-products page. */
  showViewAll?: boolean;
}

export interface FilterState {
  minPrice: number;
  maxPrice: number;
  productTypes: string[];
  designers: string[];
  colours: string[];
  materials: string[];
  sizes: string[];
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

export default function CategoryFilters({
  productTypes,
  designers,
  colours,
  materials,
  sizes,
  priceRange,
  onFilter,
  showViewAll = true,
}: Props) {
  const [minPrice, setMinPrice] = useState(priceRange[0]);
  const [maxPrice, setMaxPrice] = useState(priceRange[1]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedDesigners, setSelectedDesigners] = useState<string[]>([]);
  const [selectedColours, setSelectedColours] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    price: true,
    productType: false,
    colour: false,
    material: false,
    size: false,
    designer: false,
  });

  function toggle(s: string) { setOpenSections((p) => ({ ...p, [s]: !p[s] })); }
  function toggleItem(list: string[], item: string) { return list.includes(item) ? list.filter((i) => i !== item) : [...list, item]; }

  function applyFilters() {
    onFilter({
      minPrice,
      maxPrice,
      productTypes: selectedTypes,
      designers: selectedDesigners,
      colours: selectedColours,
      materials: selectedMaterials,
      sizes: selectedSizes,
      sort: "featured",
    });
  }
  function clearAll() {
    setMinPrice(priceRange[0]);
    setMaxPrice(priceRange[1]);
    setSelectedTypes([]);
    setSelectedDesigners([]);
    setSelectedColours([]);
    setSelectedMaterials([]);
    setSelectedSizes([]);
    onFilter({
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      productTypes: [],
      designers: [],
      colours: [],
      materials: [],
      sizes: [],
      sort: "featured",
    });
  }

  return (
    <div className="w-full">
      <h2 className="font-heading text-cacao text-2xl mb-2" style={{ fontStyle: "italic" }}>Filters</h2>

      {/* View All Products — left rail shortcut out of the current category */}
      {/* {showViewAll && (
        <Link
          href={`/category/${ALL_PRODUCTS_SLUG}`}
          className="flex items-center justify-between border border-cacao/20 px-3 py-2.5 mb-1 text-[11px] tracking-[0.18em] uppercase text-cacao hover:bg-cacao hover:text-white transition-colors"
        >
          View All Products
          <span aria-hidden>→</span>
        </Link>
      )} */}

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
              <input type="number" value={minPrice} onChange={(e) => setMinPrice(Number(e.target.value))} className="w-full bg-transparent outline-none text-sm text-cacao font-numeric" />
            </div>
            <span className="text-ink/25 text-xs font-heading">To</span>
            <div className="flex items-center border border-ink/15 rounded px-2.5 py-2 flex-1 bg-white">
              <span className="text-ink/35 mr-1">₹</span>
              <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full bg-transparent outline-none text-sm text-cacao font-numeric" />
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

      {/* Colour — swatch chips */}
      <FilterSection title="Colour" open={openSections.colour} onToggle={() => toggle("colour")}>
        <div className="flex flex-col gap-2.5">
          {colours.map((colour) => {
            const active = selectedColours.includes(colour);
            return (
              <button
                key={colour}
                onClick={() => setSelectedColours((p) => toggleItem(p, colour))}
                aria-pressed={active}
                className="flex items-center gap-3 text-left group"
              >
                <span
                  className={`w-4 h-4 rounded-full border transition-all ${
                    active ? "border-cacao ring-2 ring-cacao/25 ring-offset-1" : "border-ink/20"
                  }`}
                  style={{ backgroundColor: COLOUR_SWATCHES[colour] ?? "#D9D4CC" }}
                />
                <span className={`text-sm transition-colors ${active ? "text-cacao" : "text-ink/60 group-hover:text-cacao"}`}>
                  {colour}
                </span>
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Material */}
      <FilterSection title="Material" open={openSections.material} onToggle={() => toggle("material")}>
        <div className="flex flex-col gap-2.5">
          {materials.map((material) => (
            <label key={material} className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" checked={selectedMaterials.includes(material)} onChange={() => setSelectedMaterials((p) => toggleItem(p, material))} className="accent-sage w-4 h-4 rounded" />
              <span className="text-sm text-ink/60 group-hover:text-cacao transition-colors">{material}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Size — chip grid */}
      <FilterSection title="Size" open={openSections.size} onToggle={() => toggle("size")}>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => {
            const active = selectedSizes.includes(size);
            return (
              <button
                key={size}
                onClick={() => setSelectedSizes((p) => toggleItem(p, size))}
                aria-pressed={active}
                className={`min-w-[3rem] px-3 py-1.5 text-xs font-numeric border transition-colors ${
                  active
                    ? "border-cacao bg-cacao text-white"
                    : "border-ink/15 text-ink/60 hover:border-cacao hover:text-cacao"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Designer */}
      <FilterSection title="Designer" open={openSections.designer} onToggle={() => toggle("designer")}>
        <div className="flex flex-col gap-2.5">
          {/* Labelled generically — the real designer name stays the filter value. */}
          {designers.map((d, i) => (
            <label key={d} className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" checked={selectedDesigners.includes(d)} onChange={() => setSelectedDesigners((p) => toggleItem(p, d))} className="accent-sage w-4 h-4 rounded" />
              <span className="text-sm text-ink/60 group-hover:text-cacao transition-colors">Designer {i + 1}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Actions */}
      <div className="flex gap-3 mt-8">
        <button onClick={clearAll} className="flex-1 bg-sage text-white text-[11px] tracking-[0.18em] uppercase py-3 hover:bg-cacao transition-colors">
          Clear All
        </button>
        <button onClick={applyFilters} className="flex-1 bg-sage text-white text-[11px] tracking-[0.18em] uppercase py-3 px-1 hover:bg-cacao transition-colors">
          Apply Filters
        </button>
      </div>
    </div>
  );
}
