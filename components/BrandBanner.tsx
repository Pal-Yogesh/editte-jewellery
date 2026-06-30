"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BANNERS = [
  {
    src: "/images-2/Daily.jpg",
    textSide: "left",
    lines: ["Timeless Elegance,", "Everyday"],
  },
  {
    src: "/images-2/gift.jpg",
    textSide: "right",
    lines: ["A Sparkle For", "Every Story"],
  },
  {
    src: "/images-2/Men.jpg",
    textSide: "left",
    lines: ["Your", "Everyday Luxury"],
  },
  {
    src: "/images-2/Thebridal.jpg",
    textSide: "right",
    lines: ["Jewelry For", "Every Moment"],
  },
  {
    src: "/images-2/Vacation.jpg",
    textSide: "left",
    lines: ["Celebrate", "In Style"],
  },
  {
    src: "/images-2/Workday.jpg",
    textSide: "right",
    lines: ["Made To", "Shine With You"],
  },
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

  const banner = BANNERS[index];
  const isLeft = banner.textSide === "left";

  return (
    <section className="relative w-full h-[420px] md:h-[480px] overflow-hidden bg-salt">
      {/* Sliding banner images */}
      <AnimatePresence>
        <motion.img
          key={index}
          src={banner.src}
          alt="brand collection showcase"
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-100%", opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      {/* White shade overlay on the text side — half of image */}
      <div
        className={`absolute inset-y-0 w-[55%] z-[5] ${
          isLeft ? "left-0" : "right-0"
        }`}
        style={{
          background: isLeft
            ? "linear-gradient(to right, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.6) 60%, transparent 100%)"
            : "linear-gradient(to left, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.6) 60%, transparent 100%)",
        }}
      />

      {/* Text content — positioned left or right */}
      <div
        className={`absolute inset-y-0 z-10 flex flex-col justify-center px-10 md:px-20 ${
          isLeft ? "left-0 items-start text-left" : "right-0 items-end text-right"
        }`}
      >
        {/* First line — smaller */}
        <span
          className="font-heading text-cacao uppercase tracking-wide leading-tight"
          style={{ fontSize: "clamp(1.2rem, 3vw, 2rem)" }}
        >
          {banner.lines[0]}
        </span>
        {/* Second line — bigger and bolder */}
        <span
          className="font-heading text-cacao uppercase font-bold leading-[1] mt-1"
          style={{ fontSize: "clamp(2.2rem, 6vw, 4.5rem)" }}
        >
          {banner.lines[1]}
        </span>

        {/* Shop Now button */}
        <button className="mt-6 bg-cacao text-white text-sm tracking-[0.2em] uppercase px-8 py-3 font-medium hover:bg-sage transition-colors duration-300">
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
              background: i === index ? "#361515" : "rgba(54,21,21,0.3)",
            }}
          />
        ))}
      </div>
    </section>
  );
}
