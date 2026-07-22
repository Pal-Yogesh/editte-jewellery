"use client";
import { useState } from "react";
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

export default function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-cacao text-xl"
        aria-label="Open admin menu"
      >
        ☰
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-cacao/30" onClick={() => setOpen(false)} />
          <aside className="fixed left-0 top-0 h-full w-64 bg-cacao text-white z-50 flex flex-col">
            <div className="px-8 py-7 border-b border-white/10 flex justify-between items-center">
              <div>
                <p className="font-heading text-xl tracking-[0.3em] uppercase">editte</p>
                <p className="text-white/40 text-[10px] tracking-[0.2em] uppercase">Admin</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white text-lg">✕</button>
            </div>
            <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
              {NAV.map((item) => {
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm tracking-wide transition-colors
                      ${active ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"}`}
                  >
                    <span className="w-5 text-center">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="px-4 pb-8 border-t border-white/10 pt-4">
              <form action={adminLogoutAction}>
                <button type="submit" className="flex items-center gap-3 px-4 py-3 text-sm text-white/40 hover:text-white w-full text-left">
                  <span className="w-5 text-center">→</span> Sign Out
                </button>
              </form>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
