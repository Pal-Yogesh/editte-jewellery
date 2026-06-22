"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

export default function DiamondBanner() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Tree moves up faster — rises into the text
  const treeY = useTransform(scrollYProgress, [0, 1], [150, -100]);
  // Text stays relatively still — tree collapses into it
  const textY = useTransform(scrollYProgress, [0, 1], [0, 30]);
  // Text fades slightly as tree overlaps
  const textOpacity = useTransform(scrollYProgress, [0, 0.5, 0.8], [1, 1, 0.7]);
  // Tree scale for depth
  const treeScale = useTransform(scrollYProgress, [0, 1], [1.1, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-salt overflow-hidden h-[600px] md:h-[700px]"
    >
      {/* Tree image — background layer, parallax moves up */}
      <motion.div
        style={{ y: treeY, scale: treeScale }}
        className="absolute inset-0 z-[1]"
      >
        <Image
          src="/tree.jpeg"
          width={1920}
          height={900}
          alt="Misty forest with clouds and trees"
          className="w-full h-full object-cover"
          priority
        />
      </motion.div>

      {/* Mist/cloud overlays for atmosphere */}
      <motion.div
        style={{ opacity: useTransform(scrollYProgress, [0, 0.4, 1], [0.7, 0.3, 0.5]) }}
        className="absolute inset-0 z-[2] pointer-events-none bg-gradient-to-b from-white/80 via-transparent to-white/40"
        aria-hidden
      />

      {/* Text content — centered over the tree, collapses together on scroll */}
      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="absolute inset-0 z-[3] flex items-center justify-center"
      >
        <div className="text-center px-6">
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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="mt-7 inline-block bg-sage text-white text-xl tracking-[0.2em] uppercase px-10 py-3 rounded-full hover:bg-cacao transition-colors duration-300"
          >
            Shop Now
          </motion.button>
        </div>
      </motion.div>

      {/* Floating mist for depth */}
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, -50]) }}
        className="absolute bottom-[20%] left-[5%] w-48 h-24 rounded-full bg-white/30 blur-3xl z-[2] pointer-events-none"
        aria-hidden
      />
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [10, -30]) }}
        className="absolute bottom-[30%] right-[10%] w-36 h-20 rounded-full bg-white/25 blur-2xl z-[2] pointer-events-none"
        aria-hidden
      />
    </section>
  );
}
