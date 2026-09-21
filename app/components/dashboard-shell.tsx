"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { sidebarItemActive, sidebarItemIdle, sidebarMeta } from "@/app/theme";

/** Letter mark — matches the customer dashboard sidebar in new-jewellery. */
const LOGO = "/logo/start-letter-logo-transparent.png";

export type ShellNavItem = {
  id: string;
  label: string;
  /** Shown beside the label, same as the storefront dashboard nav. */
  icon?: string;
  /** Optional count pill (e.g. pending upload queue). */
  badge?: number;
};

type DashboardShellProps = {
  /** Small caps line under the logo — "Admin Panel", "Vendor Portal". */
  subtitle: string;
  items: readonly ShellNavItem[];
  active: string;
  onSelect: (id: string) => void;
  /** Identity lines under the subtitle (brand name, email, admin id). */
  meta?: ReactNode;
  /** Control pinned beside the logo, e.g. a refresh button. */
  headerAction?: ReactNode;
  /** Pinned to the bottom of the sidebar, e.g. sign out. */
  footer?: ReactNode;
  children: ReactNode;
};

function Badge({ count }: { count: number }) {
  return (
    <span className="ml-auto rounded-full bg-rose px-2 py-0.5 text-[10px] tracking-[0.1em] text-white">
      {count}
    </span>
  );
}

/**
 * App shell for the admin + vendor dashboards.
 *
 * Sidebar styling mirrors new-jewellery/components/dashboard/DashboardSidebar:
 * Cacao gradient, sage active state, icon + label rows.
 */
export default function DashboardShell({
  subtitle,
  items,
  active,
  onSelect,
  meta,
  headerAction,
  footer,
  children,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Fixed sidebar (desktop) ── */}
      <aside className="fixed left-0 top-0 z-40 hidden h-full w-64 flex-col bg-gradient-to-b from-cacao to-cacao/90 text-white lg:flex">
        <div className="relative border-b border-white/10">
          <div className="flex items-center justify-center py-5">
            <Image
              src={LOGO}
              alt="editte"
              width={1000}
              height={1000}
              priority
              className="h-12 w-12 object-cover brightness-0 invert"
            />
          </div>
          {headerAction ? (
            <div className="absolute right-4 top-4">{headerAction}</div>
          ) : null}
          <p className={sidebarMeta}>{subtitle}</p>
          {meta ? (
            <div className="border-t border-white/10 px-6 py-4 text-center">
              {meta}
            </div>
          ) : (
            <div className="pb-4" />
          )}
        </div>

        <nav className="hide-scrollbar flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-6">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={active === item.id ? sidebarItemActive : sidebarItemIdle}
            >
              {item.icon ? (
                <span className="w-5 text-center text-base">{item.icon}</span>
              ) : null}
              <span className="flex-1">{item.label}</span>
              {item.badge ? <Badge count={item.badge} /> : null}
            </button>
          ))}
        </nav>

        {footer ? (
          <div className="border-t border-white/10 px-4 pb-8 pt-4">{footer}</div>
        ) : null}
      </aside>

      {/* ── Sticky top bar (mobile / tablet) ── */}
      <div className="sticky top-0 z-40 bg-gradient-to-b from-cacao to-cacao/95 text-white lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Image
              src={LOGO}
              alt="editte"
              width={1000}
              height={1000}
              className="h-9 w-9 shrink-0 object-cover brightness-0 invert"
            />
            <p className="truncate text-[10px] uppercase tracking-[0.18em] text-white/40">
              {subtitle}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {headerAction}
            {footer}
          </div>
        </div>

        <nav className="hide-scrollbar flex gap-1 overflow-x-auto px-3 pb-3">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`flex shrink-0 items-center gap-2 rounded-lg border-l-2 px-4 py-2 text-xs tracking-wide transition-all duration-200 ${
                active === item.id
                  ? "border-sage bg-sage/25 text-sage"
                  : "border-transparent text-white/50 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.icon ? (
                <span className="text-sm">{item.icon}</span>
              ) : null}
              <span>{item.label}</span>
              {item.badge ? <Badge count={item.badge} /> : null}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Content column, offset past the fixed sidebar ── */}
      <main className="px-5 py-8 md:px-10 lg:ml-64">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
