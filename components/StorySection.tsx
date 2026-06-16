"use client";

import { motion } from "framer-motion";

export default function StorySection() {
  return (
    <section
      className="relative w-full bg-salt overflow-hidden"
      style={{
        backgroundImage: "url('/images/jewellery-that-speaks.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "520px",
      }}
    >


      {/* Content positioned to match the design layout */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative z-10 flex items-center justify-center min-h-[880px] px-8 md:px-20"
      >
        <div className="max-w-lg md:ml-[30%]">
          <h2
            className="font-heading text-cacao leading-[1.1]"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)", fontWeight: 700 }}
          >
            Jewelry That Speaks
            <br />
            Your Story
          </h2>
          <p className="text-ink/80 text-xl leading-relaxed mt-6 max-w-xl">
            Every piece of jewelry holds a memory, a dream, or a special moment.
            Crafted to reflect your unique journey and personal style.
            More than an accessory, it becomes a symbol of who you are.
            Wear jewelry that tells your story without saying a word.
          </p>
          <button className="mt-8 inline-block bg-sage text-white text-[22px] rounded-[20px] px-9 py-3.5 hover:bg-cacao transition-colors duration-300">
            Create Your Story
          </button>
        </div>
      </motion.div>
    </section>
  );
}
