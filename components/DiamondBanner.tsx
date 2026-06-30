"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function DiamondBanner() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-salt">
      {/* Heading — sits above the building (z-[5]) */}
      <div className="absolute inset-0 z-[5] top-[20%] flex items-center justify-start">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="font-heading text-cacao font-bold leading-[1.1] text-center px-6"
          style={{ fontSize: "clamp(2rem, 6vw, 4rem)" }}
        >
          <span className="font-script">Crafting Memories</span>
          <br /> That Last Forever
        </motion.h2>
      </div>

      {/* Foreground building/trees layer */}
      <div className="absolute inset-x-[-5%] bottom-0 z-[4] pointer-events-none">
        <Image
          src="/animation-image/image-camel.png"
          width={1000}
          height={1000}
          alt="Tree and building foreground"
          className="w-full h-[100vh] "
          priority
        />
      </div>
    </div>
  );
}
