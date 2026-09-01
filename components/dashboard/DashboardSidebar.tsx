"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import Image from "next/image";

const NAV = [
  { href: "/dashboard", label: "Home", icon: "⌂" },
  { href: "/dashboard/orders", label: "My Orders", icon: "📦" },
  { href: "/dashboard/wishlist", label: "Wishlist", icon: "♡" },
  { href: "/dashboard/cart", label: "Cart", icon: "◻" },
  { href: "/dashboard/addresses", label: "Addresses", icon: "⊙" },
  { href: "/dashboard/support", label: "Support", icon: "◎" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙" },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-cacao to-cacao/90 text-white z-40">
      {/* Logo */}
      <div className="border-b border-white/10 flex justify-center items-center">
        <Image src="/logo/logo.png" className="w-28 h-24 invert brightness-0 object-cover" alt="logo" width={1000} height={1000} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
        {NAV.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm tracking-wide transition-all duration-200
                ${active
                  ? "bg-sage/25 text-sage border-l-2 border-sage"
                  : "text-white/50 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Back to site + Logout */}
      <div className="px-4 pb-8 border-t border-white/10 pt-4 flex flex-col gap-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 text-sm text-sage/60 hover:text-sage transition-colors"
        >
          <span className="text-base w-5 text-center">↗</span>
          Back to Site
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-3 px-4 py-3 text-sm text-white/40 hover:text-white transition-colors w-full text-left"
          >
            <span className="text-base w-5 text-center">→</span>
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
