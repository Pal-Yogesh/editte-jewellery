"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { sidebarItemActive, sidebarItemIdle, sidebarMeta } from "@/app/theme";

/** The editte wordmark, inverted to white for the Cacao sidebar. */
const LOGO = "/logo/full-name-logo-removebg-preview.png";

export type ShellNavItem = {
  id: string;
  label: string;
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
    <span className="rounded-full bg-rose px-2 py-0.5 text-[10px] tracking-[0.1em] text-white">
      {count}
    </span>
  );
}

function Wordmark({ className }: { className: string }) {
  return (
    <Image
      src={LOGO}
      alt="editte"
      width={500}
      height={500}
      priority
      className={`w-auto object-contain brightness-0 invert ${className}`}
    />
  );
}

/**
 * App shell for the admin + vendor dashboards.
 *
 * Desktop (lg+): a fixed, full-height Cacao sidebar on the left; the content
 * column is offset by its width so the sidebar never scrolls away.
 * Below lg: the same navigation collapses into a sticky Cacao top bar with a
 * horizontally scrollable row of tabs, so nothing becomes unreachable.
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
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col bg-cacao text-white lg:flex">
        <div className="border-b border-white/10 px-6 py-6">
          <div className="flex items-start justify-between gap-2">
            <Wordmark className="h-11" />
            {headerAction}
          </div>
          <p className={sidebarMeta}>{subtitle}</p>
          {meta ? <div className="mt-3 space-y-0.5">{meta}</div> : null}
        </div>

        <nav className="hide-scrollbar flex-1 space-y-1 overflow-y-auto px-4 py-6">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={active === item.id ? sidebarItemActive : sidebarItemIdle}
            >
              <span className="flex items-center justify-between gap-2">
                <span>{item.label}</span>
                {item.badge ? <Badge count={item.badge} /> : null}
              </span>
            </button>
          ))}
        </nav>

        {footer ? (
          <div className="border-t border-white/10 px-4 py-4">{footer}</div>
        ) : null}
      </aside>

      {/* ── Sticky top bar (mobile / tablet) ── */}
      <div className="sticky top-0 z-40 bg-cacao text-white lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Wordmark className="h-8 shrink-0" />
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
              className={`shrink-0 rounded-lg px-4 py-2 text-xs tracking-wide transition-colors duration-200 ${
                active === item.id
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{item.label}</span>
                {item.badge ? <Badge count={item.badge} /> : null}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* ── Content column, offset past the fixed sidebar ── */}
      <main className="px-4 py-8 sm:px-6 lg:ml-64">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
