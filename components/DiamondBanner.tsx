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

  // Background moves slowly — always oversized so it never shows edges
  const bgY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  // Text moves at a different rate for depth
  const textY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const textScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1, 0.95]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.4, 1, 1, 0.5]);

  // Building foreground rises up faster — creates depth & collapse effect
  const buildingY = useTransform(scrollYProgress, [0, 1], ["30%", "-25%"]);
  const buildingScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1.05, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden h-[600px] md:h-[700px]"
    >
      {/* Background layer — sky/cloud image, oversized to prevent edge bleeding */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-[-15%] z-[1]"
      >
        <Image
          src="/animation-image/backgound-image.svg"
          width={1920}
          height={1080}
          alt="Background scenery"
          className="w-full h-full object-cover"
          priority
        />
      </motion.div>

      {/* Text content — parallax with scale and fade, above building */}
      <motion.div
        style={{ y: textY, scale: textScale, opacity: textOpacity }}
        className="absolute inset-0 -top-[50%] z-[5] flex items-center justify-center"
      >
        <div className="text-center px-6">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-heading text-cacao font-bold leading-[1.1] "
            style={{ fontSize: "clamp(2rem, 6vw, 4rem)" }}
          >
            Crafting Memories <br /> That Last Forever
          </motion.h2>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="mt-7 inline-block bg-sage text-white text-xl tracking-[0.2em] uppercase px-10 py-3 rounded-full hover:bg-cacao transition-colors duration-300"
          >
            Shop Now
          </motion.button>
        </div>
      </motion.div>

      {/* Foreground layer — Building/trees, rises up faster for depth parallax */}
      <motion.div
        style={{ y: buildingY, scale: buildingScale }}
        className="absolute inset-x-[-5%] bottom-0 z-[4] pointer-events-none"
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
