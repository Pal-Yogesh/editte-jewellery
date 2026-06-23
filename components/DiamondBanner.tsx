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

  // Building/tree foreground moves up faster — collapses into text
  const buildingY = useTransform(scrollYProgress, [0, 1], [120, -140]);
  // Background moves slower — creates depth
  const bgY = useTransform(scrollYProgress, [0, 1], [40, -60]);
  // Text stays relatively still
  const textY = useTransform(scrollYProgress, [0, 1], [0, 20]);
  // Text fades as foreground overlaps
  const textOpacity = useTransform(
    scrollYProgress,
    [0, 0.5, 0.85],
    [1, 1, 0.6],
  );
  // Foreground scale for depth
  const buildingScale = useTransform(scrollYProgress, [0, 1], [1.05, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-white overflow-hidden h-[600px] md:h-[700px]"
    >
     
      {/* Background layer — backgound-image.svg */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 z-[1]">
         <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className=" flex items-center justify-center"
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
        <Image
          src="/animation-image/backgound-image.svg"
          width={1920}
          height={900}
          alt="Background scenery"
          className="w-full h-full object-cover"
          priority
        />
      </motion.div>

      {/* Text content — centered, collapses with foreground on scroll */}
      {/* <motion.div
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
      </motion.div> */}

      {/* Foreground layer — Building-Image.svg, rises up and collapses into text */}
      <motion.div
        style={{ y: buildingY, scale: buildingScale }}
        className="absolute inset-x-0 bottom-0 z-[4] pointer-events-none"
      >
        <Image
          src="/animation-image/Building-Image.svg"
          width={1920}
          height={700}
          alt="Tree and building foreground"
          className="w-full h-auto object-contain object-bottom"
          priority
        />
      </motion.div>
    </section>
  );
}
