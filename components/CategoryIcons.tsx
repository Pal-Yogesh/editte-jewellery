"use client";

import { motion } from "framer-motion";

const CATEGORIES = [
  { label: "Bangels", image: "/basic-products/bangles.png" },
  { label: "Rings", image: "/basic-products/ring.png" },
  { label: "Earrings", image: "/basic-products/earrings.png" },
  { label: "Neck Piece", image: "/basic-products/neck-piece.png" },
  { label: "Men's Chain", image: "/basic-products/men-chain.png" },
];

export default function CategoryIcons() {
  return (
    <section className=" py-12 px-6 bg-white">
      <div className="max-w-7xl mx-auto flex items-start gap-2">
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 md:gap-4">
          {CATEGORIES.map(({ label, image }, i) => (
            <motion.button
              key={label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
              className="group flex flex-col items-center gap-3"
            >
              <div className="w-20 h-20 md:w-48 md:h-48 transition-transform duration-300 group-hover:-translate-y-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt={label}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-heading text-cacao text-base md:text-lg">
                {label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
