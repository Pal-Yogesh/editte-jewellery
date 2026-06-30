"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BANNERS = [
  {
    src: "/images-2/Daily.jpg",
    textSide: "right",
    lines: ["A Statement,", "Without Words"],
    subtitle:
      "Minimal in design, powerful in presence. Pieces crafted to complement your individuality while elevating every look.",
  },
  {
    src: "/images-2/gift.jpg",
    textSide: "left",
    lines: ["Built to", "Be Remembered"],
    subtitle:
      "Thoughtfully designed treasures that turn every occasion into a memory worth keeping forever.",
  },
  {
    src: "/images-2/Men.jpg",
    textSide: "right",
    lines: ["Crafted Beyond", "Trends"],
    subtitle:
      "Bold, refined and effortless. Statement pieces made to move with you through every moment.",
  },
  {
    src: "/images-2/Thebridal.jpg",
    textSide: "left",
    lines: ["Made for", "Every Moment"],
    subtitle:
      "From the first glance to forever after. Heirloom craftsmanship for the moments that matter most.",
  },
  {
    src: "/images-2/Vacation.jpg",
    textSide: "right",
    lines: ["Beyond", "Ordianry"],
    subtitle:
      "Light, radiant and made to travel. Pieces that capture the glow of every getaway.",
  },
  {
    src: "/images-2/Workday.jpg",
    textSide: "left",
    lines: ["Wear What", "Defines You"],
    subtitle:
      "Understated elegance for the everyday. Designed to elevate your look from desk to dinner.",
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
  const isLeft = banner.textSide === "left";

  return (
    <section className="w-full bg-salt py-8 overflow-hidden">
      <div className=" mx-auto px-6 md:px-10 ">
        <div
          className={`flex flex-col border-cacao border-4 rounded-2xl items-center gap-8 md:gap-16 ${
            isLeft ? "md:flex-row-reverse" : "md:flex-row"
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
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="flex flex-col items-center text-center"
              >
                <h2
                  className="font-heading text-cacao uppercase font-bold leading-[1.05]"
                  style={{ fontSize: "clamp(1.9rem, 4vw, 3.2rem)" }}
                >
                  <span className="block">{banner.lines[0]}</span>
                  <span className="block">{banner.lines[1]}</span>
                </h2>

                <p className="mt-5 text-ink/60 uppercase text-[11px] md:text-xs tracking-[0.08em] leading-relaxed max-w-sm">
                  {banner.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>

            <button className="mt-7 bg-cacao text-white text-sm tracking-[0.2em] uppercase px-8 py-3 font-medium hover:bg-sage transition-colors duration-300">
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
