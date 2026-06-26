"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BANNERS = [
  { src: "/brand-image/Daily.jpeg", textSide: "left" },
  { src: "/brand-image/Festive.jpeg", textSide: "right" },
  { src: "/brand-image/Men.jpeg", textSide: "right" },
  { src: "/brand-image/Thebridal.jpeg", textSide: "left" },
  { src: "/brand-image/gift.jpeg", textSide: "left" },
  { src: "/brand-image/Vacation.jpeg", textSide: "right" },
  { src: "/brand-image/Workday.jpeg", textSide: "left" },
  { src: "/brand-image/Untitled.jpeg", textSide: "right" },
] as const;

const INTERVAL = 4500;

export default function BrandBanner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % BANNERS.length);
    }, INTERVAL);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative w-full h-[450px] min-h-[450px] overflow-hidden bg-cacao">
      {/* Sliding banner images — left to right */}
      <AnimatePresence>
        <motion.img
          key={index}
          src={BANNERS[index].src}
          alt="brand collection showcase"
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-100%", opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full "
        />
      </AnimatePresence>

      {/* Soft overlay for legibility */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(54,21,21,0.25) 0%, rgba(54,21,21,0.05) 40%, rgba(54,21,21,0.2) 100%)",
        }}
      />

      {/* Shop Now button — positioned on the text side (left or right per image) */}
      <div
        className={`absolute bottom-16 z-10 ${
          BANNERS[index].textSide === "left" ? "left-12 md:left-20" : "right-12 md:right-20"
        }`}
      >
        <button className="bg-cacao text-white text-sm tracking-[0.15em] uppercase px-8 py-3 rounded-sm font-medium hover:bg-sage transition-colors duration-300">
          Shop Now
        </button>
      </div>

      {/* Slide dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === index ? "24px" : "8px",
              background: i === index ? "#fff" : "rgba(255,255,255,0.5)",
            }}
          />
        ))}
      </div>
    </section>
  );
}
