"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ALL_PRODUCTS_SLUG } from "@/lib/categoryProducts";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category =
  | "NEW IN"
  | "WOMEN"
  | "MEN"
  | "DESIGNERS"
  | "OCCASIONS"
  | "SALE";

interface NavItem {
  label: string;
  badge?: string;
}

interface NavSection {
  number: string;
  title: string;
  items: NavItem[];
  /** Target for this section's "View All" row. Defaults to the full catalogue. */
  viewAllHref?: string;
}

/** The full catalogue — every "View All" falls back to this. */
const ALL_PRODUCTS_HREF = `/category/${ALL_PRODUCTS_SLUG}`;

// ─── Content Data ─────────────────────────────────────────────────────────────

const NAV_DATA: Record<Category, NavSection[]> = {
  "NEW IN": [
    {
      number: "01",
      title: "LATEST",
      items: [
        { label: "New Arrivals", badge: "NEW" },
        { label: "Best Sellers" },
        { label: "Just Restocked" },
        { label: "Trending Now" },
      ],
    },
  ],
  WOMEN: [
    {
      number: "01",
      title: "JEWELLERY",
      items: [
        { label: "Neckpieces" },
        { label: "Earrings" },
        { label: "Rings" },
        { label: "Bangles & Bracelets" },
        { label: "Anklets" },
        { label: "Nose Pins" },
        { label: "Maang Tikka" },
        { label: "Brooches" },
      ],
    },
    {
      number: "02",
      title: "BAGS",
      items: [
        { label: "Clutches" },
        { label: "Tote Bags" },
        { label: "Sling Bags" },
        { label: "Handbags" },
        { label: "Potli Bags" },
      ],
    },
    // {
    //   number: "03",
    //   title: "FOOTWEAR",
    //   items: [
    //     { label: "Heels" },
    //     { label: "Flats" },
    //     { label: "Wedges" },
    //     { label: "Juttis" },
    //     { label: "Sandals" },
    //   ],
    // },
    {
      number: "03",
      title: "ACCESSORIES",
      items: [
        { label: "Hair Accessories" },
        { label: "Scarves & Stoles" },
        { label: "Sunglasses" },
        { label: "Watches" },
        { label: "Belts" },
      ],
    },
  ],
  "MEN": [
    {
      number: "01",
      title: "NEW IN",
      items: [
        { label: "New Arrivals", badge: "NEW" },
        { label: "Best Sellers" },
      ],
    },
    {
      number: "02",
      title: "JEWELLERY",
      items: [
        { label: "Chains" },
        { label: "Rings" },
        { label: "Bracelets" },
        { label: "Cufflinks" },
        { label: "Tie Pins" },
      ],
    },
  ],
  DESIGNERS: [
    {
      number: "01",
      title: "DESIGNERS",
      items: [
        { label: "Coming Soon" },
      ],
    },
  ],
  OCCASIONS: [
    {
      number: "01",
      title: "CELEBRATIONS",
      items: [
        { label: "Bridal" },
        { label: "Showstopper" },
        { label: "Everyday" },
        { label: "Vacation" },
        { label: "Festive Finds" },
        { label: "Gift" },
      ],
    },
  ],
  SALE: [
    {
      number: "01",
      title: "OFFERS",
      items: [
        { label: "All Sale Items" },
        { label: "Jewellery on Sale" },
        { label: "Bags on Sale" },
        { label: "Accessories on Sale" },
        { label: "Last Chance" },
      ],
    },
  ],
};

const CATEGORIES: Category[] = [
  "NEW IN",
  "WOMEN",
  "MEN",
  "DESIGNERS",
  "OCCASIONS",
  "SALE",
];

const ease = [0.76, 0, 0.24, 1] as const;

const overlayVariants = {
  hidden: { clipPath: "inset(0 0 100% 0)" },
  visible: {
    clipPath: "inset(0 0 0% 0)",
    transition: { duration: 0.7, ease },
  },
  exit: {
    clipPath: "inset(0 0 100% 0)",
    transition: { duration: 0.55, ease },
  },
};

const logoVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease, delay: 0.2 },
  },
};

const dividerVariants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.7, ease, delay: 0.25 },
  },
};

const catListVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.28 } },
};

const catItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease } },
};

const contentVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.0 } },
  exit: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.2, ease } },
};

// ─── Hamburger ────────────────────────────────────────────────────────────────

function Hamburger({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      className="fixed top-6 left-6 z-[400] flex flex-col justify-center items-start gap-[7px] w-10 h-10 bg-transparent border-0 cursor-pointer p-0"
    >
      <motion.span
        className="block h-[2px] rounded-full origin-center"
        animate={
          open
            ? { width: 28, rotate: 45, y: 4.5, backgroundColor: "#b3ad6e" }
            : { width: 36, rotate: 0, y: 0, backgroundColor: "#361515" }
        }
        transition={{ duration: 0.38, ease }}
      />
      <motion.span
        className="block h-[2px] rounded-full origin-center"
        animate={
          open
            ? { width: 28, rotate: -45, y: -4.5, backgroundColor: "#b3ad6e" }
            : { width: 36, rotate: 0, y: 0, backgroundColor: "#361515" }
        }
        transition={{ duration: 0.38, ease }}
      />
    </button>
  );
}

// ─── Category List ────────────────────────────────────────────────────────────

function CategoryList({
  active,
  onSelect,
  onNavigate,
}: {
  active: Category;
  onSelect: (c: Category) => void;
  onNavigate: () => void;
}) {
  return (
    <motion.ul
      variants={catListVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col w-64 shrink-0 gap-1"
    >
      {CATEGORIES.map((cat) => {
        const isActive = cat === active;
        // SALE is called out in red; every other category uses the cacao ramp.
        const isSale = cat === "SALE";
        const colour = isSale
          ? isActive
            ? "text-red-600"
            : "text-red-600/45 group-hover:text-red-600/75"
          : isActive
            ? "text-cacao"
            : "text-cacao/25 group-hover:text-cacao/50";
        return (
          <motion.li key={cat} variants={catItemVariants}>
            <button
              onClick={() => onSelect(cat)}
              onMouseEnter={() => onSelect(cat)}
              className="flex items-center gap-2 text-left w-full py-1 bg-transparent border-0 cursor-pointer group"
            >
              {/* Active indicator */}
              <motion.span
                className="text-sage text-lg leading-none"
                animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : -6 }}
                transition={{ duration: 0.25, ease }}
              >
                ·
              </motion.span>
              <span
                className={`font-heading leading-tight tracking-wide transition-colors duration-300 ${colour}`}
                style={{ fontSize: "clamp(1rem, 3vw, 1.75rem)" }}
              >
                {cat}
              </span>
            </button>
          </motion.li>
        );
      })}

      {/* Always-visible shortcut to the whole catalogue — sits below SALE */}
      <motion.li variants={catItemVariants} className="mt-6">
        <Link
          href={ALL_PRODUCTS_HREF}
          onClick={onNavigate}
          className="inline-flex items-center justify-between gap-3 w-full max-w-[15rem] border border-cacao/25 px-4 py-3 text-[11px] tracking-[0.2em] uppercase text-cacao hover:bg-cacao hover:text-white hover:border-cacao transition-colors"
        >
          View All Products
          <span aria-hidden>→</span>
        </Link>
      </motion.li>
    </motion.ul>
  );
}

// ─── Section Content ──────────────────────────────────────────────────────────

function SectionContent({
  sections,
  onNavigate,
}: {
  sections: NavSection[];
  onNavigate: () => void;
}) {
  const ROW_H = 40;
  const VIEW_ALL_H = 34;
  const GROUP_GAP = 40;

  // Each group is its item rows plus the "View All" row beneath them.
  const groupH = (sec: NavSection) => sec.items.length * ROW_H + VIEW_ALL_H;

  // Running top offset for each group's label, stacked in order.
  const offsets = sections.reduce<number[]>((acc, sec, i) => {
    const prev = i === 0 ? 0 : acc[i - 1] + groupH(sections[i - 1]) + GROUP_GAP;
    return [...acc, prev];
  }, []);

  return (
    <motion.div
      variants={contentVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex gap-12 flex-1 min-w-0"
    >
      {/* Section labels */}
      <div className="relative w-52 shrink-0">
        {sections.map((sec, i) => (
          <motion.div
            key={sec.number}
            variants={rowVariants}
            className="absolute flex items-center gap-2"
            style={{ top: offsets[i] + 2 }}
          >
            <span className="text-[16px] text-cacao tracking-[0.18em]">
              |{sec.number}|
            </span>
            <span className="text-[16px] font-heading tracking-[0.2em] text-cacao uppercase">
              {sec.title}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Item lists */}
      <div className="flex flex-col">
        {sections.map((sec, si) => (
          <div key={sec.number} className={si > 0 ? "mt-10" : ""}>
            {sec.items.map((item) => (
              <motion.div
                key={item.label}
                variants={rowVariants}
                className="flex items-baseline gap-1.5 py-0.5 -mt-1 group"
              >
                <a
                  href="#"
                  className="text-[1.5rem] text-ink hover:text-sage transition-colors duration-200 leading-relaxed relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-px left-0 h-px w-0 bg-sage group-hover:w-full transition-[width] duration-300" />
                </a>
                {item.badge && (
                  <span className="text-[7px] font-bold tracking-[0.18em] text-sage uppercase leading-none">
                    {item.badge}
                  </span>
                )}
              </motion.div>
            ))}

            {/* View All for this section */}
            <motion.div
              variants={rowVariants}
              className="flex items-center"
              style={{ height: VIEW_ALL_H }}
            >
              <Link
                href={sec.viewAllHref ?? ALL_PRODUCTS_HREF}
                onClick={onNavigate}
                className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.2em] uppercase text-cacao/50 hover:text-sage transition-colors"
              >
                View All
                <span aria-hidden>→</span>
              </Link>
            </motion.div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Category Images ──────────────────────────────────────────────────────────

const CATEGORY_IMAGES: Record<Category, string[]> = {
  "NEW IN":       ["/images-2/Daily.jpg", "/basic-products/ring.png"],
  WOMEN:          ["/basic-products/earrings.png", "/basic-products/neck-piece.png"],
  "MEN": ["/images-2/Men.jpg", "/basic-products/men-chain.png"],
  DESIGNERS:      ["/images-3/image-1.png", "/images-3/image-2.png"],
  OCCASIONS:      ["/images-2/Thebridal.jpg", "/images-2/Vacation.jpg"],
  SALE:           ["/images-2/Workday.jpg", "/basic-products/earrings.png"],
};

function ImagePanel({ category }: { category: Category }) {
  const images = CATEGORY_IMAGES[category];
  return (
    <div className="hidden lg:flex flex-col gap-4 shrink-0 w-[220px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={category}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.5, ease }}
          className="flex flex-col gap-4"
        >
          {images.map((src, i) => (
            <div key={i} className="w-[250px] h-[230px] overflow-hidden">
              <img
                src={src}
                alt={`${category} collection`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── ZaraNavbar ───────────────────────────────────────────────────────────────

export default function ZaraNavbar({ actions }: { actions?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>("NEW IN");

  return (
    <>
      {/* ── Fixed Header Bar (over hero) ── */}
      <header className="fixed top-0 left-0 right-0 z-[500] pointer-events-none">
        <div className="flex items-start justify-between px-5 sm:px-7 pt-5">
          {/* Left — Hamburger (inline, not fixed separately) */}
          <button
            onClick={() => setIsOpen((v) => !v)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            className="flex flex-col justify-center items-start gap-[7px] w-10 h-10 bg-transparent border-0 cursor-pointer p-0 z-[500] pointer-events-auto"
          >
            <motion.span
              className="block h-[2px] rounded-full origin-center"
              animate={
                isOpen
                  ? { width: 28, rotate: 45, y: 4.5, backgroundColor: "#b3ad6e" }
                  : { width: 36, rotate: 0, y: 0, backgroundColor: "#361515" }
              }
              transition={{ duration: 0.38, ease }}
            />
            <motion.span
              className="block h-[2px] rounded-full origin-center"
              animate={
                isOpen
                  ? { width: 28, rotate: -45, y: -4.5, backgroundColor: "#b3ad6e" }
                  : { width: 36, rotate: 0, y: 0, backgroundColor: "#361515" }
              }
              transition={{ duration: 0.38, ease }}
            />
          </button>

          {/* Right — actions (Search, Bag, Help, Login/Name) */}
          <div className="pointer-events-auto">{actions}</div>
        </div>
      </header>

      <AnimatePresence>
        {isOpen && (
          <motion.nav
            key="zara-nav"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[300] bg-salt overflow-hidden"
            style={{ willChange: "clip-path" }}
          >
            {/* ── Logo ── */}
            <motion.div
              variants={logoVariants}
              initial="hidden"
              animate="visible"
              className="pt-6 pb-4 pl-[10%] pr-10 flex items-center justify-between"
            >
              <Image
                src="/logo/logo.png"
                className="w-36 h-32"
                alt="editte logo"
                width={1000}
                height={1000}
              />
             
            </motion.div>

            {/* ── Divider ── */}
            <motion.div
              variants={dividerVariants}
              initial="hidden"
              animate="visible"
              className="h-px bg-cacao/15 mx-[10%] mb-10"
            />

            {/* ── Main grid ── */}
            <div className="flex pl-[10%] pr-10 gap-14 pb-20 items-start" style={{ height: "calc(100vh - 140px)" }}>
              {/* Col 1 – categories (fixed, non-scrolling) */}
              <div className="shrink-0 sticky top-0 self-start">
                <CategoryList
                  active={activeCategory}
                  onSelect={setActiveCategory}
                  onNavigate={() => setIsOpen(false)}
                />
              </div>

              {/* Col 2+3 – content (scrollable) */}
              <div className="flex-1 min-w-0 overflow-y-auto h-full pr-4 hide-scrollbar">
                <AnimatePresence mode="wait">
                  <SectionContent
                    key={activeCategory}
                    sections={NAV_DATA[activeCategory]}
                    onNavigate={() => setIsOpen(false)}
                  />
                </AnimatePresence>
              </div>

              {/* Col 4 – images */}
              <ImagePanel category={activeCategory} />
            </div>

          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
