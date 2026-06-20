"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function StorySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Parallax: images move at different speeds
  const leftY = useTransform(scrollYProgress, [0, 1], [80, -90]);
  const rightY = useTransform(scrollYProgress, [0, 1], [120, -40]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-salt overflow-hidden min-h-[600px] md:min-h-[700px]"
    >
      {/* Left model image — parallax */}
      <motion.div
        style={{ y: leftY }}
        className="absolute left-0 top-0 bottom-0 w-[30%] md:w-[28%] z-[1]"
      >
        <img
          src="/images/girls/model-1.png"
          alt="Model wearing jewellery"
          className="w-full h-full object-cover object-top"
        />
      </motion.div>

      {/* Right model image — parallax */}
      <motion.div
        style={{ y: rightY }}
        className="absolute right-0 top-0 bottom-0 w-[22%] md:w-[20%] z-[1]"
      >
        <img
          src="/images/girls/model-2.png"
          alt="Model wearing jewellery"
          className="w-full h-full object-cover object-top"
        />
      </motion.div>

      {/* Center content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative z-10 flex items-center justify-center min-h-[600px] md:min-h-[700px] px-8 md:px-20"
      >
        <div className="max-w-lg text-center md:text-left md:ml-[5%]">
          <h2
            className="font-heading text-cacao leading-[1.1]"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)", fontWeight: 700 }}
          >
            Jewelry That Speaks
            <br />
            Your Story
          </h2>
          <p className="text-ink/80 text-base md:text-lg leading-relaxed mt-6 max-w-xl">
            Every piece of jewelry holds a memory, a dream, or a special moment.
            Crafted to reflect your unique journey and personal style.
            More than an accessory, it becomes a symbol of who you are.
            Wear jewelry that tells your story without saying a word.
          </p>
          <button className="mt-8 inline-block bg-sage text-white text-lg rounded-[20px] px-9 py-3.5 hover:bg-cacao transition-colors duration-300">
            Create Your Story
          </button>
        </div>
      </motion.div>
    </section>
  );
}
