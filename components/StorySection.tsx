"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function StorySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Multi-speed parallax transforms
  const leftY = useTransform(scrollYProgress, [0, 1], [120, -120]);
  const rightY = useTransform(scrollYProgress, [0, 1], [160, -60]);
  const bgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.05, 1, 1.02]);
  const contentY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const leftRotate = useTransform(scrollYProgress, [0, 1], [-2, 2]);
  const rightRotate = useTransform(scrollYProgress, [0, 1], [2, -2]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0.3, 0, 0, 0.3]);

  // Staggered text animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 40, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-salt overflow-hidden min-h-[600px] md:min-h-[750px]"
    >
      {/* Animated background gradient that shifts with scroll */}
      <motion.div
        style={{ scale: bgScale, opacity: overlayOpacity }}
        className="absolute inset-0 z-0 pointer-events-none"
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cacao/5 via-transparent to-sage/5" />
      </motion.div>

      {/* Floating decorative elements — parallax particles */}
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [-20, 60]) }}
        className="absolute top-[15%] left-[12%] w-3 h-3 rounded-full bg-sage/20 blur-[1px] z-0"
        aria-hidden
      />
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [30, -50]) }}
        className="absolute top-[35%] right-[15%] w-2 h-2 rounded-full bg-cacao/15 blur-[1px] z-0"
        aria-hidden
      />
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [-10, 40]) }}
        className="absolute bottom-[25%] left-[35%] w-4 h-4 rounded-full bg-sage/10 blur-sm z-0"
        aria-hidden
      />

      {/* Left model image — parallax + tilt */}
      <motion.div
        style={{ y: leftY, rotate: leftRotate }}
        className="absolute left-0 top-0 bottom-0 w-[30%] md:w-[28%] z-[1]"
      >
        <motion.img
          initial={{ opacity: 0, x: -60, scale: 0.95 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease: "easeOut" }}
          src="/images/girls/model-1.png"
          alt="Model wearing jewellery"
          className="w-full h-full object-cover object-top"
        />
        {/* Soft gradient fade on inner edge */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-salt/60 pointer-events-none" />
      </motion.div>

      {/* Right model image — parallax + tilt */}
      <motion.div
        style={{ y: rightY, rotate: rightRotate }}
        className="absolute right-0 top-0 bottom-0 w-[22%] md:w-[20%] z-[1]"
      >
        <motion.img
          initial={{ opacity: 0, x: 60, scale: 0.95 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          src="/images/girls/model-2.png"
          alt="Model wearing jewellery"
          className="w-full h-full object-cover object-top"
        />
        {/* Soft gradient fade on inner edge */}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-salt/60 pointer-events-none" />
      </motion.div>

      {/* Center content — parallax + staggered reveal */}
      <motion.div
        style={{ y: contentY }}
        className="relative z-10 flex items-center justify-center min-h-[600px] md:min-h-[750px] px-8 md:px-20"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="max-w-lg text-center md:text-left md:ml-[5%]"
        >
          {/* Decorative line */}
          <motion.div
            variants={childVariants}
            className="w-12 h-[2px] bg-sage/60 mb-6 mx-auto md:mx-0"
          />

          <motion.h2
            variants={childVariants}
            className="font-heading text-cacao leading-[1.1]"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)", fontWeight: 700 }}
          >
            Jewelry That Speaks
            <br />
            Your Story
          </motion.h2>

          <motion.p
            variants={childVariants}
            className="text-ink/80 text-base md:text-lg leading-relaxed mt-6 max-w-xl"
          >
            Every piece of jewelry holds a memory, a dream, or a special moment.
            Crafted to reflect your unique journey and personal style.
            More than an accessory, it becomes a symbol of who you are.
            Wear jewelry that tells your story without saying a word.
          </motion.p>

          <motion.div variants={childVariants}>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0,0,0,0.12)" }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="mt-8 inline-block bg-sage text-white text-lg rounded-[20px] px-9 py-3.5 hover:bg-cacao transition-colors duration-300"
            >
              Create Your Story
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
