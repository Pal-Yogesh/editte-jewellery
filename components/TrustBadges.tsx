"use client";

import { motion } from "framer-motion";

const STROKE = "#b3ad6e"; // sage

function ShieldCheck() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke={STROKE} strokeWidth="1.6" className="w-10 h-10">
      <path d="M24 4 L40 10 V24 C40 34 33 41 24 44 C15 41 8 34 8 24 V10 Z" />
      <path d="M17 24 l5 5 l9 -11" />
    </svg>
  );
}
function Truck() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke={STROKE} strokeWidth="1.6" className="w-10 h-10">
      <rect x="4" y="14" width="22" height="16" rx="1" />
      <path d="M26 19 h8 l6 6 v5 h-14 z" />
      <circle cx="14" cy="34" r="3.5" />
      <circle cx="34" cy="34" r="3.5" />
    </svg>
  );
}
function Return() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke={STROKE} strokeWidth="1.6" className="w-10 h-10">
      <path d="M12 18 a14 14 0 1 1 -2 12" />
      <polyline points="12 8 12 18 22 18" />
    </svg>
  );
}
function Card() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke={STROKE} strokeWidth="1.6" className="w-10 h-10">
      <rect x="5" y="12" width="32" height="22" rx="2" />
      <line x1="5" y1="19" x2="37" y2="19" />
      <path d="M33 28 a6 6 0 1 0 6 6" />
      <path d="M40 26 v6 h-6" />
    </svg>
  );
}

const BADGES = [
  { Icon: ShieldCheck, titleNum: "100%", titleRest: " AUTHENTIC", sub: "EVERY PIECE CERTIFIED BY MASTER ARTISANS" },
  { Icon: Truck, titleNum: "", titleRest: "FREE SHIPPING", sub: "ON ALL ORDERS ABOVE ₹ 2,000" },
  { Icon: Return, titleNum: "", titleRest: "EASY RETURNS", sub: "HASSLE-FREE 16-DAYS RETURN POLICY" },
  { Icon: Card, titleNum: "", titleRest: "SECURE PAYMENT", sub: "UPI, CARDS, EMI & MORE" },
];

export default function TrustBadges() {
  return (
    <section className="bg-white py-5 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
        {BADGES.map(({ Icon, titleNum, titleRest, sub }, i) => (
          <motion.div
            key={titleRest}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="flex flex-col items-center text-center gap-1"
          >
            <Icon />
            <p className="text-cacao text-[10px] font-bold ">
              {titleNum && <span className="font-numeric">{titleNum}</span>}
              {titleRest}
            </p>
            <p className="text-ink/50 text-[9px]">
              {sub}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
