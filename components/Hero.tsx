"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BANNERS = [
  "/images/main-banner/1.png",
  "/images/main-banner/2.jpg",
  "/images/main-banner/3.jpg",
];

const INTERVAL = 4500; // ms per slide

export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % BANNERS.length);
    }, INTERVAL);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative w-full h-screen min-h-[480px] overflow-hidden bg-cacao">
      {/* Crossfading banner images */}
      <AnimatePresence>
        <motion.img
          key={index}
          src={BANNERS[index]}
          alt="editta jewellery campaign"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 1.2 }, scale: { duration: 5 } }}
          className="absolute inset-0 w-full h-full object-cover object-center"
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
