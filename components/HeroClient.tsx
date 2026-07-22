"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function HeroClient({ banners, intervalMs }: { banners: string[]; intervalMs: number }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % banners.length), intervalMs);
    return () => clearInterval(id);
  }, [banners.length, intervalMs]);

  return (
    <section className="relative w-full h-[100svh] min-h-[600px] overflow-hidden bg-cacao">
      <AnimatePresence>
        <motion.img
          key={index}
          src={banners[index]}
          alt="editte jewellery campaign"
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-100%", opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </AnimatePresence>
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, rgba(54,21,21,0.25) 0%, rgba(54,21,21,0.05) 40%, rgba(54,21,21,0.2) 100%)" }}
      />
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{ width: i === index ? "24px" : "8px", background: i === index ? "#fff" : "rgba(255,255,255,0.5)" }}
          />
        ))}
      </div>
    </section>
  );
}
