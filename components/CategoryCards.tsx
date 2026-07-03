"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const CARDS = [
  { label: "WOMAN", image: "/men-women/women.png" },
  { label: "MAN", image: "/men-women/men.png" },
  { label: "BRANDS", image: "/men-women/brand.png" },
];

export default function CategoryCards() {
  return (
    <section className="px-3 py-10 bg-white">
    
      <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 md:gap-6">
         
        {CARDS.map((card, i) => (
          <motion.a
            key={card.label}
            href="#"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
            className="group flex flex-col items-center gap-3 w-full max-w-[240px] mx-auto"
          >
            <div className="relative w-full aspect-[4/5] overflow-hidden rounded-xl ">
              <Image
                src={card.image}
                alt={card.label}
                fill
                sizes="(max-width: 768px) 33vw, 240px"
                className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <span className="text-sm md:text-base font-medium tracking-widest uppercase text-neutral-700 transition-colors group-hover:text-neutral-900">
              {card.label}
            </span>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
