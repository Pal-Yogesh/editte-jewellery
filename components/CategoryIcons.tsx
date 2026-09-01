"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const CATEGORIES = [
  { label: "Bangles", image: "/after-banner/bangles.png", slug: "bangles" },
  { label: "Rings", image: "/after-banner/rings (2).png", slug: "rings" },
  { label: "Earrings", image: "/after-banner/earrings.png", slug: "earrings" },
  { label: "Neck Piece", image: "/after-banner/neck pieces.png", slug: "neck-piece" },
  { label: "Men's Chain", image: "/after-banner/men-chain.png", slug: "mens-chain" },
];

export default function CategoryIcons() {
  return (
    <section className="py-12 px-6">
      <div className="max-w-7xl mx-auto flex items-start gap-2">
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-5 gap-8 md:gap-4">
          {CATEGORIES.map(({ label, image, slug }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
            >
              <Link
                href={`/category/${slug}`}
                className="group flex flex-col items-center gap-3"
              >
                <div className="w-20 h-20 md:w-60 md:h-60 transition-transform duration-300 group-hover:-translate-y-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={label}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-heading text-cacao text-base md:text-lg group-hover:text-sage transition-colors">
                  {label}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="flex justify-center items-center">
        <Link href="/category/bangles">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-7 inline-block bg-sage cursor-pointer text-white text-xs md:text-xl px-10 py-2 font-medium hover:bg-cacao transition-colors duration-300"
          >
            Shop All
          </motion.span>
        </Link>
      </div>
    </section>
  );
}
