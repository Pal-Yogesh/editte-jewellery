"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminLogoutAction } from "@/app/actions/adminAuth";

const NAV = [
  { href: "/admin",          label: "Overview",        icon: "⌂",  exact: true },
  { href: "/admin/content",  label: "Content",         icon: "✎" },
  { href: "/admin/media",    label: "Media Library",   icon: "⊞" },
  { href: "/admin/users",    label: "Users",           icon: "👤" },
  { href: "/admin/orders",   label: "Orders",          icon: "📦" },
  { href: "/admin/support",  label: "Support Tickets", icon: "◎" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 bg-cacao text-white z-40">
      {/* Logo */}
      <div className="px-8 py-7 border-b border-white/10">
        <p className="font-heading text-xl tracking-[0.3em] uppercase text-white">editte</p>
        <p className="text-white/40 text-[10px] mt-1 tracking-[0.2em] uppercase">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href) && item.href !== "/admin";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm tracking-wide transition-colors
                ${active
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white hover:bg-white/5"}`}
            >
              <span className="w-5 text-center text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* View site + Logout */}
      <div className="px-4 pb-8 border-t border-white/10 pt-4 flex flex-col gap-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-4 py-3 text-sm text-white/40 hover:text-white transition-colors"
        >
          <span className="w-5 text-center">↗</span>
          View Site
        </Link>
        <form action={adminLogoutAction}>
          <button
            type="submit"
            className="flex items-center gap-3 px-4 py-3 text-sm text-white/40 hover:text-white transition-colors w-full text-left"
          >
            <span className="w-5 text-center">→</span>
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
