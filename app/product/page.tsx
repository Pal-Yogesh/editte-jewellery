"use client";

import { useState } from "react";

const PRODUCT = {
  name: "Taarini Hasli",
  brand: "Noor By Varnan",
  price: "₹ 12,500",
  badge: "Collector's Item — Single Piece Only",
  description:
    "The Taarini Hasli is a striking expression of strength and simplicity. Crafted with deep black obsidian, the piece carries a bold, grounding presence while maintaining a clean and modern silhouette.",
  note: "Each creation is inspired by timeless heirloom jewellery and crafted to carry an antique finish. Every piece is made by hand, not machine.",
  details: [
    { label: "Material", value: "925 Sterling Silver with 24k Gold Colour" },
    { label: "Stone", value: "Black Obsidian" },
    { label: "Weight", value: "57 g" },
  ],
  offers: [
    "Get 10% off on your first order — Use code NIMAIMela10",
    "Ships within 1–2 business days",
  ],
  images: [
    "https://i.pinimg.com/1200x/97/20/44/972044bcd12b64b342d532f6a11b6666.jpg",
    "https://i.pinimg.com/736x/e9/d6/b0/e9d6b0103854e095997bd8a7b6d776fa.jpg",
    "https://i.pinimg.com/736x/dc/41/6f/dc416f68be573e0c41e6ba2411c13280.jpg",
    "https://i.pinimg.com/1200x/65/25/eb/6525ebd1351659aa94b618162251c257.jpg",
  ],
};

export default function ProductPage() {
  const [selected, setSelected] = useState(0);
  const [imageStyle, setImageStyle] = useState<"rounded" | "sharp">("rounded");

  return (

    <>
     <div className="min-h-screen bg-[#F5F0EB] pt-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

          {/* ── Left: Images ── */}
          <div>
            {/* Main image */}
            <div
              className={`relative w-full aspect-square overflow-hidden bg-[#F5F0EB] mb-3 ${
                imageStyle === "rounded" ? "rounded-2xl" : "rounded-none"
              }`}
            >
              <img
                src={PRODUCT.images[selected]}
                alt={PRODUCT.name}
                className="w-full h-full object-cover transition-all duration-500"
              />
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2">
              {PRODUCT.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`relative w-20 h-20 overflow-hidden bg-[#F5F0EB] transition-all duration-200 ${
                    imageStyle === "rounded" ? "rounded-lg" : "rounded-none"
                  } ${
                    selected === i
                      ? "ring-2 ring-[#8B8B3E] ring-offset-2"
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Image style toggle */}
            <div className="flex items-center gap-3 mt-4">
              <span className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-medium">View:</span>
              <button
                onClick={() => setImageStyle("rounded")}
                className={`text-[10px] tracking-[0.15em] uppercase font-semibold px-3 py-1.5 rounded-full border transition-all ${
                  imageStyle === "rounded"
                    ? "bg-[#8B8B3E] text-white border-[#8B8B3E]"
                    : "text-gray-500 border-gray-200 hover:border-gray-400"
                }`}
              >
                Rounded
              </button>
              <button
                onClick={() => setImageStyle("sharp")}
                className={`text-[10px] tracking-[0.15em] uppercase font-semibold px-3 py-1.5 rounded-full border transition-all ${
                  imageStyle === "sharp"
                    ? "bg-[#8B8B3E] text-white border-[#8B8B3E]"
                    : "text-gray-500 border-gray-200 hover:border-gray-400"
                }`}
              >
                Sharp
              </button>
            </div>
          </div>

          {/* ── Right: Info ── */}
          <div className="flex flex-col">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-[#8B8B3E] font-semibold mb-3">
              <span className="w-5 h-px bg-[#8B8B3E]" />
              {PRODUCT.badge}
            </span>

            {/* Brand */}
            <p className="text-[11px] tracking-[0.2em] uppercase text-gray-400 mb-1">
              {PRODUCT.brand}
            </p>

            {/* Name */}
            <h1
              className="text-gray-900 font-bold leading-tight mb-4"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
              }}
            >
              {PRODUCT.name}
            </h1>

            {/* Price */}
            <p
              className="text-gray-900 font-semibold mb-6"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem" }}
            >
              {PRODUCT.price}
            </p>

            {/* Offers */}
            <div className="flex flex-col gap-2 mb-6">
              {PRODUCT.offers.map((offer) => (
                <div key={offer} className="flex items-start gap-2">
                  <span className="text-[#D4A843] text-xs mt-0.5">✦</span>
                  <p className="text-[12px] text-gray-500">{offer}</p>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 mb-8">
              <button className="w-full bg-[#8B8B3E] hover:bg-[#747430] text-white text-[11px] tracking-[0.22em] uppercase font-bold py-4 rounded-sm transition-colors">
                Add to Cart
              </button>
              <button className="w-full bg-gray-900 hover:bg-gray-800 text-white text-[11px] tracking-[0.22em] uppercase font-bold py-4 rounded-sm transition-colors">
                Buy Now
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100 mb-6" />

            {/* Description */}
            <p
              className="text-gray-600 leading-relaxed mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem" }}
            >
              {PRODUCT.description}
            </p>
            <p className="text-[11px] text-gray-400 italic leading-relaxed mb-6">
              {PRODUCT.note}
            </p>

            {/* Details */}
            <div className="flex flex-col gap-2">
              {PRODUCT.details.map((d) => (
                <div key={d.label} className="flex items-center gap-3">
                  <span className="text-[10px] tracking-[0.18em] uppercase text-gray-400 font-semibold w-20 shrink-0">
                    {d.label}
                  </span>
                  <span className="text-[13px] text-gray-700">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>



    
    
    </>
   
  );
}