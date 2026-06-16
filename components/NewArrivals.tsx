"use client";

import { useRef } from "react";
import { motion } from "framer-motion";

const PRODUCTS = [
  { name: "Ring", price: "₹ 3,000", image: "/images/products/NECK%20PIECES.png" },
  { name: "Ring", price: "₹ 3,000", image: "/images/products/RING.png" },
  { name: "Ring", price: "₹ 3,000", image: "/images/products/BANGLES.png" },
  { name: "Ring", price: "₹ 3,000", image: "/images/products/EARRINGS.png" },
  { name: "Ring", price: "₹ 3,000", image: "/images/products/NECK%20PIECES.png" },
  { name: "Ring", price: "₹ 3,000", image: "/images/products/RING.png" },
  { name: "Ring", price: "₹ 3,000", image: "/images/products/EARRINGS.png" },
  { name: "Ring", price: "₹ 3,000", image: "/images/products/BANGLES.png" },
];

export default function NewArrivals() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 220;
    scrollRef.current.scrollBy({
      left: dir === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-salt py-14 px-20 relative overflow-hidden">
      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-heading text-cacao text-center mb-9"
        style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}
      >
        New Arrivals
      </motion.h2>

      {/* Scroll arrows */}
      <button
        onClick={() => scroll("left")}
        aria-label="Scroll left"
        className="absolute left-2 top-1/2 translate-y-4 z-10 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-cacao hover:bg-cacao hover:text-white transition-colors"
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        onClick={() => scroll("right")}
        aria-label="Scroll right"
        className="absolute right-2 top-1/2 translate-y-4 z-10 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-cacao hover:bg-cacao hover:text-white transition-colors"
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Scrollable product row */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto overflow-y-hidden hide-scrollbar pb-2 scroll-smooth"
      >
        {PRODUCTS.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            className="shrink-0 w-auto h-full  group cursor-pointer"
          >
            {/* Card */}
            <div className="bg-white rounded-[25px] shadow-sm overflow-hidden p-3">
              <div className="relative w-72 h-60" >
                <img
                  src={p.image}
                  alt={p.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="mt-3 text-left">
                <p className="text-ink text-sm font-medium">{p.name}</p>
                <p className="text-cacao/60 text-xs mt-0.5">{p.price}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
