"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BANNERS = [
  "/brand-image/Daily.jpeg",
  "/brand-image/Festive.jpeg",
  "/brand-image/Men.jpeg",
  "/brand-image/Thebridal.jpeg",
  "/brand-image/gift.jpeg",
  "/brand-image/Vacation.jpeg",
  "/brand-image/Workday.jpeg",
  "/brand-image/Untitled.jpeg",
];

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
          src={BANNERS[index]}
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
