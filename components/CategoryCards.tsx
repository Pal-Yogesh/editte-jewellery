"use client";

import { motion } from "framer-motion";

const ManIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 md:w-14 md:h-14">
    <circle cx="32" cy="14" r="8" />
    <path d="M20 56V36a12 12 0 0 1 24 0v20" />
    <path d="M26 56V44" />
    <path d="M38 56V44" />
    <path d="M24 30l-4 14" />
    <path d="M40 30l4 14" />
  </svg>
);

const WomanIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 md:w-14 md:h-14">
    <circle cx="32" cy="14" r="8" />
    <path d="M22 56l4-20a6 6 0 0 1 12 0l4 20" />
    <path d="M20 36c4 0 8-4 12-4s8 4 12 4" />
    <path d="M28 56v-8" />
    <path d="M36 56v-8" />
    <path d="M24 28l-4 12" />
    <path d="M40 28l4 12" />
  </svg>
);

const BrandIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 md:w-14 md:h-14">
    <rect x="8" y="16" width="48" height="36" rx="3" />
    <path d="M8 26h48" />
    <circle cx="32" cy="40" r="8" />
    <path d="M28 40l3 3 5-6" />
  </svg>
);

const CARDS = [
  { label: "MAN", icon: ManIcon },
  { label: "WOMAN", icon: WomanIcon },
  { label: "BRANDS", icon: BrandIcon },
];

export default function CategoryCards() {
  return (
    <section className=" px-3 bg-salt">
      <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 md:gap-6">
        {CARDS.map((card, i) => (
          <motion.a
            key={card.label}
            href="#"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
            className="group flex flex-col items-center justify-center gap-3 aspect-square max-w-[220px] mx-auto w-full  hover:shadow-md transition-all duration-300 text-neutral-700 hover:text-neutral-900"
          >
            <card.icon />
            <span className="text-sm md:text-base font-medium tracking-widest uppercase">
              {card.label}
            </span>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
