"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function DiamondBanner() {
  return (
    <section className="bg-salt">
      {/* Heading + CTA */}
      <div className="text-center px-6 pt-12 pb-10">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="font-heading text-cacao font-bold leading-[1.1]"
          style={{ fontSize: "clamp(2rem, 6vw, 4rem)" }}
        >
          Moments Become
          <br />
          Memories with Diamonds
        </motion.h2>

        <motion.button
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-7 inline-block bg-sage text-white text-xl tracking-[0.2em] uppercase px-10 py-3 rounded-full hover:bg-cacao transition-colors duration-300"
        >
          Shop Now
        </motion.button>
      </div>

      {/* Full-width rings showcase */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative w-full overflow-hidden"
      >
        <div className="">
          <div className="relative">
            <Image
              src="/images/mid-banner/mid-banner3.jpg"
              width={1000}
              height={1000}
              alt="mid-banner"
              className="w-screen h-[510px] "
            />
            {/* Light pink tint overlay */}
            <div className="absolute inset-0 bg-rose/70 mix-blend-multiply" />
          </div>
          <Image
            src="/images/mid-banner/mid-banner.jpg"
            width={1000}
            height={1000}
            alt="mid-banner"
            className="w-screen h-[400px]"
          />
        </div>
      </motion.div>
    </section>
  );
}
