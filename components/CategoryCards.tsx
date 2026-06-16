"use client";

import { motion } from "framer-motion";

const CARDS = [
  {
    label: "MAN",
    image: "/images/brands-for-men-women/MEN.png",
  },
  {
    label: "WOMAN",
    image: "/images/brands-for-men-women/WOMEN.png",
  },
  {
    label: "BRANDS",
    image: "/images/brands-for-men-women/BRANDS.jpg",
  },
];

export default function CategoryCards() {
  return (
    <section className=" pb-10 px-3 bg-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3">
        {CARDS.map((card, i) => (
          <motion.a
            key={card.label}
            href="#"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
            className="relative group overflow-hidden w-[400px] h-[450px]"
          >
            <img
              src={card.image}
              alt={card.label}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-cacao/10 group-hover:bg-cacao/20 transition-colors duration-500" />

            {/* Framed label */}
            <div className="absolute inset-4 border border-white/70 flex items-center justify-center">
              <span
                className="font-heading text-white text-3xl md:text-4xl tracking-wide"
                style={{ textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}
              >
                {card.label}
              </span>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
