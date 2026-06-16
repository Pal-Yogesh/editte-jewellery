"use client";

import { motion } from "framer-motion";

const DESIGNERS = [
  "/images/designers/4.png",
  "/images/designers/5.png",
  "/images/designers/1.png",
  "/images/designers/2.png",
  "/images/designers/3.png",
];

export default function Designers() {
  return (
    <section className="bg-salt pt-10 pb-20">
      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-heading text-cacao text-center mb-9 px-4"
        style={{ fontSize: "clamp(1.9rem, 4vw, 2.8rem)", fontWeight: 700 }}
      >
        Our Designers
      </motion.h2>

      {/* Designer photos — full-bleed staggered row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-0">
        {DESIGNERS.map((src, i) => {
          // gentle wave: outer photos high, center photo lowest
          const offsets = [0, 18, 36, 18, 0];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative overflow-hidden group"
              style={{ aspectRatio: "4/5", marginTop: `${offsets[i] ?? 0}px` }}
            >
              <img
                src={src}
                alt={`Designer ${i + 1}`}
                className="absolute inset-0 w-full px-2 h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
              />
            </motion.div>
          );
        })}
      </div>

      {/* Promise */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center mt-12 px-4"
      >
        <p className="text-cacao/50 text-[20px] tracking-[0.3em] uppercase mb-3">
          Our Promise
        </p>
        <h3
          className="font-heading text-cacao leading-[1.1]"
          style={{ fontSize: "clamp(1.8rem, 4.5vw, 3rem)", fontWeight: 700 }}
        >
          Made by Hand, Felt by Heart
        </h3>
        <p className="text-ink/80 text-xl leading-relaxed mt-5 max-w-3xl mx-auto">
          India&apos;s first jewellery makers collective — connecting 40+
          independent designers with those who appreciate the art of adornment.
        </p>

        <div className="flex items-center justify-center gap-4 mt-8 flex-wrap">
          <button className="bg-sage text-white text-[24px] rounded-2xl px-9 py-3 hover:bg-cacao transition-colors duration-300">
            Our Story
          </button>
          <button className="border border-sage text-sage text-[24px] rounded-2xl px-9 py-3 hover:bg-sage hover:text-white transition-colors duration-300">
            Meet Designer
          </button>
        </div>
      </motion.div>
    </section>
  );
}
