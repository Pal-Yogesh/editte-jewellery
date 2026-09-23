"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export type DesignerTile = {
  slug: string;
  brandName: string;
  logo: string;
};

export default function DesignersGrid({ designers }: { designers: DesignerTile[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-0">
      {designers.map((d, i) => {
        const offsets = [0, 18, 36, 18, 0];
        const offset = offsets[i % offsets.length] ?? 0;
        return (
          <motion.div
            key={d.slug}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="relative overflow-hidden group"
            style={{
              aspectRatio: "4/5",
              marginTop: `${offset}px`,
            }}
          >
            <Link href={`/designer/${d.slug}`} className="absolute inset-0 block">
              {d.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={d.logo}
                  alt={d.brandName}
                  className="absolute inset-0 w-full px-2 h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-2 flex items-center justify-center bg-sand/40 grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105">
                  <span className="font-heading text-cacao text-4xl uppercase">
                    {d.brandName.charAt(0)}
                  </span>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-cacao/70 to-transparent px-3 py-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs tracking-[0.12em] uppercase text-center truncate">
                  {d.brandName}
                </p>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
