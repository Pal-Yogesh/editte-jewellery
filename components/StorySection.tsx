"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function StorySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Zoom effect — aggressive scale up on scroll down
  const leftScale = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [0.6, 1, 1.4, 1.8]);
  const rightScale = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [0.65, 1.05, 1.45, 1.85]);

  // Left comes from left, right comes from right — horizontal movement
  const leftX = useTransform(scrollYProgress, [0, 0.4, 1], [-200, 0, 50]);
  const rightX = useTransform(scrollYProgress, [0, 0.4, 1], [200, 0, -50]);

  // Vertical parallax
  const leftY = useTransform(scrollYProgress, [0, 1], [80, -120]);
  const rightY = useTransform(scrollYProgress, [0, 1], [120, -80]);

  // Content parallax
  const contentY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const contentScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.95]);

  // Rotation for more dynamism
  const leftRotate = useTransform(scrollYProgress, [0, 0.5, 1], [-8, 0, 5]);
  const rightRotate = useTransform(scrollYProgress, [0, 0.5, 1], [8, 0, -5]);

  // Opacity — fade in as they enter
  const leftOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0.7]);
  const rightOpacity = useTransform(scrollYProgress, [0, 0.25, 0.8, 1], [0, 1, 1, 0.7]);

  // Background overlay
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0.4, 0, 0, 0.4]);

  // Staggered text animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 50, filter: "blur(6px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 1, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-salt overflow-hidden min-h-[650px] md:min-h-[800px]"
    >
      {/* Animated background gradient */}
      <motion.div
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 z-0 pointer-events-none"
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cacao/5 via-transparent to-sage/5" />
      </motion.div>

      {/* Left model — slides in from LEFT, zooms on scroll */}
      <motion.div
        style={{
          y: leftY,
          x: leftX,
          scale: leftScale,
          rotate: leftRotate,
          opacity: leftOpacity,
        }}
        className="absolute left-0 top-[30%] bottom-0 w-[32%] h-[60%] md:w-[15%] z-[1] origin-left"
      >
        <img
          src="/images/girls/model-1.png"
          alt="Model wearing jewellery"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-salt/60 pointer-events-none" />
      </motion.div>

      {/* Right model — slides in from RIGHT, zooms on scroll */}
      <motion.div
        style={{
          y: rightY,
          x: rightX,
          scale: rightScale,
          rotate: rightRotate,
          opacity: rightOpacity,
        }}
        className="absolute right-0 top-0 bottom-0 w-[24%] md:w-[22%] z-[1] origin-right"
      >
        <img
          src="/images/girls/model-2.png"
          alt="Model wearing jewellery"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-salt/60 pointer-events-none" />
      </motion.div>

      {/* Center content — parallax + staggered reveal */}
      <motion.div
        style={{ y: contentY, scale: contentScale }}
        className="relative z-10 flex items-center justify-center min-h-[650px] md:min-h-[800px] px-8 md:px-20"
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
              whileHover={{ scale: 1.08, boxShadow: "0 12px 35px rgba(0,0,0,0.15)" }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
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
