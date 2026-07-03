"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BANNERS = [
  {
    src: "/banner3/TheBridal.png",
    textSide: "right",
    lines: ["The Bridal &", "Ceremony"],
    subtitle: "Celebrate every special moment with timeless elegance.",
  },
  {
    src: "/banner3/Gift.png",
    textSide: "left",
    lines: ["Gift Guide", "Icons"],
    subtitle: "Effortless essentials designed for everyday sophistication.",
  },
  {
    src: "/banner3/Workday.png",
    textSide: "right",
    lines: ["Workday", "Luxe"],
    subtitle: "Refined pieces that elevate your professional style.",
  },
  {
    src: "/banner3/Vacation.png",
    textSide: "left",
    lines: ["Vacation", "Escape"],
    subtitle: "Lightweight luxury for every journey and getaway.",
  },
  {
    src: "/banner3/Festive-Finds.png",
    textSide: "right",
    lines: ["Festive", "Finds"],
    subtitle: "Shine brighter during every celebration and festival.",
  },
  {
    src: "/banner3/Gift-guide.png",
    textSide: "left",
    lines: ["The Gift", "Guide"],
    subtitle: "Thoughtful gifts that create lasting memories.",
  },
] as const;

const INTERVAL = 5000;

export default function BrandBanner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % BANNERS.length);
    }, INTERVAL);
    return () => clearInterval(id);
  }, []);

  const banner = BANNERS[index];
  const textOnLeft = banner.textSide === "left";

  return (
    <section className="w-full bg-salt py-8 overflow-hidden">
      <div className=" mx-auto px-6 md:px-10  pt-10 bg-cacao">
        <div
          className={`flex flex-col rounded-2xl items-center gap-8 md:gap-16 ${
            textOnLeft ? "md:flex-row-reverse" : "md:flex-row"
          }`}
        >
          {/* Image side — crossfades in place only */}
          <div className="w-full md:w-[58%] relative h-[260px] md:h-[330px]">
            <AnimatePresence initial={false}>
              <motion.img
                key={banner.src}
                src={banner.src}
                alt="brand collection showcase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full  object-cover rounded-2xl md:rounded-3xl shadow-sm"
              />
            </AnimatePresence>
          </div>

          {/* Text side — text content changes independently */}
          <div className="w-full md:w-[42%] flex flex-col items-center text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="flex flex-col items-center text-center"
              >
                <h2
                  className="font-heading text-white uppercase font-bold leading-[1.05]"
                  style={{ fontSize: "clamp(1.9rem, 4vw, 3.2rem)" }}
                >
                  <span className="block">{banner.lines[0]}</span>
                  <span className="block">{banner.lines[1]}</span>
                </h2>

                <p className="mt-5 text-white uppercase text-[11px] md:text-xs tracking-[0.08em] leading-relaxed max-w-sm">
                  {banner.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>

            <button className="mt-7 bg-sage hover:border-2 hover:border-sage cursor-pointer text-white text-sm tracking-[0.2em] uppercase px-8 py-3 font-medium hover:bg-cacao transition-colors duration-300">
              View Collection
            </button>
          </div>
        </div>

        {/* Slide dots */}
        <div className="flex justify-center items-center gap-2 mt-10">
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
      </div>
    </section>
  );
}
