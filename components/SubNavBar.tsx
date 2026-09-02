"use client";

const LINKS = [
  // { label: "Shop By", href: "#" },
  { label: "Women", href: "#" },
  { label: "Men's Editte", href: "#" },
  { label: "Brands", href: "#" },
];

export default function SubNavBar() {
  return (
    <nav className="w-full bg-cacao">
      <div className="max-w-6xl mx-auto flex items-center justify-center">
        {LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="flex-1 text-center py-3 text-white text-xs sm:text-lg tracking-[0.18em] uppercase transition-all duration-300 border-b-2 border-transparent hover:bg-sage hover:text-cacao hover:border-sage font-bold"
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
