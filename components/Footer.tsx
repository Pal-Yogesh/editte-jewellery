"use client";

const COLLECTIONS = [
  "New Arrivals",
  "Bridal Edit",
  "Festive Picks",
  "Everyday Luxe",
  "Silver Essentials",
  "Kundan & Jadau",
];
const QUICK_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Our Designers", href: "#" },
  { label: "Custom Orders", href: "#" },
  { label: "Gift Cards", href: "#" },
  { label: "Size Guide", href: "#" },
  { label: "Care Instruction", href: "#" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden">
      <img
        src="/images/footer.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-[100vh] "
      />

      {/* Gradient tint: white at top → dark at bottom */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 20%, rgba(255,255,255,0.5) 40%, rgba(30,15,10,0.6) 60%, rgba(20,10,5,0.85) 80%, rgba(10,5,2,0.95) 100%)",
        }}
      />

      <div className="relative z-10">
        {/* Logo centered */}
        <div className="text-center">
          <img
            src="/logo/full-name-logo-removebg-preview.png"
            alt="editte logo"
            className="mx-auto h-16 md:h-40 object-contain"
          />
        </div>

        {/* Columns */}
        <div className=" px-12 pb-8 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
          {/* Brand blurb */}
          <div>
            <p className="text-white text-sm leading-relaxed max-w-[280px] mt-12">
              We&apos;ve always believed that style should feel like your own. Some days, that looks simple. Some days it&apos;s expressive, and sometimes it&apos;s something you wear every day.
            </p>
          </div>

          {/* Collections */}
          <div>
            <p className="font-heading text-cacao text-xl mb-3">Collections</p>
            <ul className="flex flex-col gap-1.5">
              {COLLECTIONS.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-white text-sm hover:text-cacao transition-colors"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <p className="font-heading text-cacao text-xl mb-3">Quick Links</p>
            <ul className="flex flex-col gap-1.5">
              {QUICK_LINKS.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-white text-sm hover:text-cacao transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="font-heading text-cacao text-xl mb-3">Contact</p>
            <ul className="flex flex-col gap-1.5 text-white text-sm">
              <li>Brand Studio India</li>
              <li>+91 22 2600 0000</li>
              <li>hello@shopeditte.com</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className=" px-12 py-5 border-t border-white flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-salt/80 text-sm">@ Copyright 2026 . editte</p>
          <div className="flex items-center gap-5">
            <a
              href="/cookie-policy"
              className="text-salt/80 text-sm hover:text-salt transition-colors"
            >
              Cookie Policy
            </a>
            <a
              href="/privacy-policy"
              className="text-salt/80 text-sm hover:text-salt transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/term-condition"
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
