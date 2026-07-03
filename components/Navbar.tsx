"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavLink {
  label: string;
  badge?: string;
  href?: string;
}
interface NavColumn {
  title: string;
  links: NavLink[];
}
interface NavCategory {
  id: string;
  heading: string;
  columns: NavColumn[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const NAV: NavCategory[] = [
  {
    id: "woman",
    heading: "Woman",
    columns: [
      {
        title: "New In",
        links: [
          { label: "New Arrivals", badge: "NEW" },
          { label: "Best Sellers" },
          { label: "Just Restocked" },
          { label: "Trending Now" },
        ],
      },
      {
        title: "Jewellery",
        links: [
          { label: "Neckpieces" },
          { label: "Earrings" },
          { label: "Rings" },
          { label: "Bangles" },
          { label: "Anklets" },
        ],
      },
      {
        title: "Collections",
        links: [
          { label: "Bridal Edit", badge: "NEW" },
          { label: "Festive Picks" },
          { label: "Everyday Luxe" },
          { label: "Gift Sets" },
        ],
      },
    ],
  },
  {
    id: "man",
    heading: "Man",
    columns: [
      {
        title: "New In",
        links: [
          { label: "New Arrivals", badge: "NEW" },
          { label: "Best Sellers" },
          { label: "Gifting Edit" },
        ],
      },
      {
        title: "Jewellery",
        links: [
          { label: "Rings" },
          { label: "Bracelets" },
          { label: "Chains" },
          { label: "Cufflinks" },
        ],
      },
      {
        title: "Collections",
        links: [
          { label: "Minimalist" },
          { label: "Statement Pieces" },
          { label: "Wedding Edit" },
        ],
      },
    ],
  },
  {
    id: "brand",
    heading: "Brand",
    columns: [
      {
        title: "About",
        links: [
          { label: "Our Story" },
          { label: "Makers Collective" },
          { label: "Sustainability" },
          { label: "Press" },
        ],
      },
      {
        title: "Designers",
        links: [
          { label: "Meet the Artisans" },
          { label: "Collaborations", badge: "NEW" },
          { label: "Apply as Designer" },
        ],
      },
      {
        title: "More",
        links: [
          { label: "Journal" },
          { label: "Gift Cards" },
          { label: "Store Locator" },
          { label: "Contact Us" },
        ],
      },
    ],
  },
];

const ease = [0.76, 0, 0.24, 1] as const;

const overlayV = {
  hidden: { clipPath: "inset(0 0 100% 0)" },
  visible: { clipPath: "inset(0 0 0% 0)", transition: { duration: 0.65, ease } },
  exit: { clipPath: "inset(0 0 100% 0)", transition: { duration: 0.5, ease } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
};
const colV = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

function Hamburger({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={open ? "Close menu" : "Open menu"}
      className="flex flex-col justify-center items-start gap-[7px] w-10 h-10 bg-transparent border-0 cursor-pointer p-0"
    >
      <motion.span
        className="block h-[2px] rounded-full origin-center"
        animate={open ? { width: 28, rotate: 45, y: 4.5, backgroundColor: "#b3ad6e" } : { width: 36, rotate: 0, y: 0, backgroundColor: "#361515" }}
        transition={{ duration: 0.38, ease }}
      />
      <motion.span
        className="block h-[2px] rounded-full origin-center"
        animate={open ? { width: 28, rotate: -45, y: -4.5, backgroundColor: "#b3ad6e" } : { width: 36, rotate: 0, y: 0, backgroundColor: "#361515" }}
        transition={{ duration: 0.38, ease }}
      />
    </button>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* ── Fixed Header Bar (over hero) ── */}
      <header className="fixed top-0 left-0 right-0 z-[500]">
        <div className="flex items-start justify-between px-5 sm:px-7 pt-5">
          {/* Left — Hamburger */}
          <Hamburger open={isOpen} onClick={() => setIsOpen((v) => !v)} />

          {/* Right — actions */}
          <div className="flex flex-col items-end gap-2 text-cacao text-sm sm:text-base font-normal tracking-wide uppercase">
            <button className="hover:opacity-60 transition-opacity">Search</button>
            <button className="hover:opacity-60 transition-opacity">Shopping Bag</button>
            <button className="hover:opacity-60 transition-opacity">Login</button>
            <button className="hover:opacity-60 transition-opacity">Help</button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[390] bg-cacao/20"
              onClick={() => setIsOpen(false)}
            />

            <motion.nav
              key="nav-overlay"
              variants={overlayV}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-[400] bg-salt overflow-y-auto"
              // style={{
              //   willChange: "clip-path",
              //   backgroundImage: "url('/EDITTA BACKGOUND/2.jpg')",
              //   backgroundSize: "cover",
              //   backgroundPosition: "cover",
              //   backgroundRepeat: "no-repeat",
              // }}
            >
              <div className="min-h-full flex flex-col px-10 sm:px-16 lg:px-24 pt-12 pb-12">
                {/* Logo row */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="flex items-center justify-between mb-8"
                >
                  <Image src="/logo/logo.png" className="w-20 h-20 " alt="logo" width={1000} height={1000} />
                 
                </motion.div>

                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, ease, delay: 0.25 }}
                  className="h-px bg-cacao/15 mb-12 origin-left"
                />

                <motion.div
                  variants={stagger}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-3 gap-0 flex-1"
                >
                  {NAV.map((cat, ci) => (
                    <motion.div
                      key={cat.id}
                      variants={colV}
                      className={`pb-10 sm:pb-0 ${ci < NAV.length - 1 ? "sm:border-r border-cacao/10 sm:pr-12" : ""} ${ci > 0 ? "sm:pl-12" : ""}`}
                    >
                      <h2 className="font-heading text-cacao leading-none mb-8 text-[clamp(2.4rem,4vw,3.8rem)]">
                        {cat.heading}
                      </h2>

                      <div className="grid grid-cols-3 gap-6">
                        {cat.columns.map((col) => (
                          <div key={col.title}>
                            <p className="text-[9px] tracking-[0.22em] uppercase font-semibold text-cacao/40 mb-3">
                              {col.title}
                            </p>
                            <ul className="flex flex-col gap-1.5">
                              {col.links.map((link) => (
                                <li key={link.label} className="flex items-center gap-1.5">
                                  <a
                                    href="#"
                                    className="text-[0.82rem] text-ink hover:text-sage transition-colors duration-200 leading-snug relative group"
                                  >
                                    {link.label}
                                    <span className="absolute -bottom-px bg-sage left-0 h-px w-0 group-hover:w-full transition-[width] duration-300" />
                                  </a>
                                  {link.badge && (
                                    <span className="text-[8px] font-bold tracking-[0.15em] text-sage uppercase leading-none">
                                      {link.badge}
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      {ci < NAV.length - 1 && (
                        <div className="sm:hidden mt-10 h-px bg-cacao/10" />
                      )}
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.65, duration: 0.4 }}
                  className="mt-12 pt-6 border-t border-cacao/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-6">
                    {["About Us", "Careers", "Press"].map((l) => (
                      <a key={l} href="#" className="text-[10px] tracking-[0.2em] uppercase text-cacao/40 hover:text-sage transition-colors">
                        {l}
                      </a>
                    ))}
                  </div>
                  <div className="flex items-center gap-6">
                    {["Instagram", "Pinterest", "YouTube"].map((s) => (
                      <a key={s} href="#" className="text-[10px] tracking-[0.2em] uppercase text-cacao/40 hover:text-sage transition-colors">
                        {s}
                      </a>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
