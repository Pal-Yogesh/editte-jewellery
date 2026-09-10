"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const CATEGORIES = [
  { label: "Bangles", image: "/after-banner/bangles.png", slug: "bangles" },
  { label: "Rings", image: "/after-banner/rings (2).png", slug: "rings" },
  { label: "Earrings", image: "/after-banner/earrings.png", slug: "earrings" },
  { label: "Neck Piece", image: "/after-banner/neck pieces.png", slug: "neck-piece" },
  { label: "Men's Chain", image: "/after-banner/men-chain.png", slug: "mens-chain" },
];

export default function CategoryIcons() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") =>
    scrollRef.current?.scrollBy({ left: dir === "right" ? 220 : -220, behavior: "smooth" });

  return (
    <section className="py-12 px-6">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        {/* Left arrow — line with arrowhead ← */}
        <button onClick={() => scroll("left")} aria-label="Scroll left"
          className="shrink-0 text-cacao/60 hover:text-cacao transition-colors">
          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        {/* Scrollable categories */}
        <div ref={scrollRef} className="flex-1 flex gap-8 md:gap-4 overflow-x-auto hide-scrollbar scroll-smooth">
          {CATEGORIES.map(({ label, image, slug }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
              className="shrink-0 flex-1 min-w-[120px]"
            >
              <Link
                href={`/category/${slug}`}
                className="group flex flex-col items-center gap-3"
              >
                <div className="w-20 h-20 md:w-60 md:h-60 transition-transform duration-300 group-hover:-translate-y-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={label}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-heading text-cacao text-base md:text-lg group-hover:text-sage transition-colors">
                  {label}
                </span>
              </Link>
            </motion.div>
          ))}
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

      <div className="flex justify-center items-center">
        <Link href="/category/bangles">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-7 inline-block bg-sage cursor-pointer text-white text-xs md:text-xl px-10 py-2 font-medium hover:bg-cacao transition-colors duration-300"
          >
            Shop All
          </motion.span>
        </Link>
      </div>
    </section>
  );
}
