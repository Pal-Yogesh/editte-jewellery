"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function DiscoverSection() {
  return (
    <section className="relative w-full bg-salt overflow-hidden">
      <div className=" mx-auto px-8 md:px-24 pb-12 md:pb-32 flex flex-col md:flex-row items-center gap-8 md:gap-0">
        {/* Left — Text content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex-1 text-center md:text-left z-10"
        >
          <h2 className="font-heading text-cacao leading-[1.15]">
            <span
              className="font-accent block"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
            >
              Discover
            </span>
            <span
              className="font-bold uppercase tracking-wider block"
              style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.4rem)" }}
            >
              Your Perfect Match
            </span>
          </h2>

          <p className="text-ink/60 text-xs md:text-sm leading-relaxed mt-5 max-w-sm uppercase tracking-wider">
            Let our style consultants help you find accessories that reflect
            confidence, elegance, and timeless craftsmanship.
          </p>
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-7 inline-block bg-sage text-white text-xs md:text-sm  px-5  py-3.5 font-medium hover:bg-cacao transition-colors duration-300"
          >
            Book a Personal Appointment
          </motion.button>
        </motion.div>

        {/* Right — Two overlapping images */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          className="flex-1 relative h-[280px] md:h-[320px]"
        >
          {/* Back image — image-2, larger, on the right */}
          <div className="absolute right-0 top-0 w-[80%] h-full overflow-hidden shadow-xl">
            <Image
              src="/images-3/image-2.png"
              fill
              sizes="(max-width: 768px) 80vw, 40vw"
              alt="Gold rings and chains on satin"
              className="object-cover"
            />
          </div>
          {/* Front image — image-1, overlaps on the left with white border */}
          <div className="absolute -left-[10%] top-[35%] w-[60%] h-[80%] overflow-hidden shadow-2xl border-4 border-white z-10">
            <Image
              src="/images-3/image-1.png"
              fill
              sizes="(max-width: 768px) 60vw, 30vw"
              alt="Gold chain necklace"
              className="object-cover"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
