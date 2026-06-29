"use client";

import Link from "next/link";

const COLLECTIONS = [
  "New Arrivals",
  "Bridal Edit",
  "Festive Picks",
  "Everyday Luxe",
  "Silver Essentials",
  "Kundan & Jadau",
];
const QUICK_LINKS = [
  "About Us",
  "Our Designers",
  "Custom Orders",
  "Gift Cards",
  "Size Guide",
  "Care Instruction",
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden">
      <img
        src="/images/footer.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover "
      />

      {/* Gradient tint: white at top → dark at bottom */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.95) 10%, rgba(255,255,255,0.85) 25%, rgba(255,255,255,0.5) 50%, rgba(30,15,10,0.6) 74%, rgba(20,10,5,0.85) 80%, rgba(10,5,2,0.95) 100%)",
        }}
      />

      <div className="relative z-10">
        {/* Logo centered */}
        <div className="text-center ">
          <img
            src="/logo/logo.png"
            alt="editte logo"
            className="mx-auto h-16 md:h-44 object-contain"
          />
        </div>

       

        {/* Bottom bar */}
        <div className=" px-12 py-7 border-t border-white flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-salt/80 text-sm">@ Copyright 2026 . editte</p>
          <div className="flex items-center gap-5">
            <a
              href="#"
              className="text-salt/80 text-sm hover:text-salt transition-colors"
            >
              Contact Us
            </a>
            <a
              href="#"
              className="text-salt/80 text-sm hover:text-salt transition-colors"
            >
              Return Policy
            </a>
            <a
              href="#"
              className="text-salt/80 text-sm hover:text-salt transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-salt/80 text-sm hover:text-salt transition-colors"
            >
              Terms Condition
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
