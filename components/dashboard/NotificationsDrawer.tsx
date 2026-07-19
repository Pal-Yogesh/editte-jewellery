"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { useActionState } from "react";
import { markNotificationReadAction, markAllReadAction } from "@/app/actions/notifications";
import type { Notification } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

const TYPE_ICONS: Record<Notification["type"], string> = {
  order: "📦",
  wishlist: "♡",
  promo: "✦",
  account: "⚙",
};

// ── Single notification card ──────────────────────────────────────────────────
function NotifCard({ notif }: { notif: Notification }) {
  const [, action] = useActionState(markNotificationReadAction, undefined);
  return (
    <div
      className={`flex gap-3 px-5 py-4 border-b border-ink/5 last:border-0 transition-colors
        ${notif.read ? "bg-white" : "bg-sand/20"}`}
    >
      <span className="text-lg shrink-0 mt-0.5">{TYPE_ICONS[notif.type]}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${notif.read ? "text-ink/60" : "font-heading text-cacao"}`}>
          {notif.title}
        </p>
        <p className="text-xs text-ink/40 mt-0.5 leading-relaxed">{notif.message}</p>
        <p className="text-xs text-ink/25 mt-1">
          {new Date(notif.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
      {!notif.read && (
        <form action={action}>
          <input type="hidden" name="id" value={notif.id} />
          <button
            type="submit"
            className="text-[10px] text-ink/30 hover:text-cacao underline transition-colors shrink-0 mt-0.5"
          >
            Mark read
          </button>
        </form>
      )}
    </div>
  );
}

// ── Mark all read button ──────────────────────────────────────────────────────
function MarkAllButton({ unread }: { unread: number }) {
  const [, action, pending] = useActionState(markAllReadAction, undefined);
  if (unread === 0) return null;
  return (
    <form action={action}>
      <button
        type="submit"
        disabled={pending}
        className="text-xs text-cacao underline hover:text-sage transition-colors disabled:opacity-40"
      >
        {pending ? "Marking…" : "Mark all as read"}
      </button>
    </form>
  );
}

// ── Drawer ────────────────────────────────────────────────────────────────────
interface Props {
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
  unread: number;
}

export default function NotificationsDrawer({ open, onClose, notifications, unread }: Props) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-cacao/20 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: [0.32, 0, 0.18, 1] }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-salt z-[101] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-ink/10 shrink-0">
              <div>
                <h2 className="font-heading text-cacao text-xl">Notifications</h2>
                {unread > 0 && (
                  <p className="text-ink/40 text-xs mt-0.5">{unread} unread</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <MarkAllButton unread={unread} />
                <button
                  onClick={onClose}
                  aria-label="Close notifications"
                  className="text-ink/40 hover:text-cacao transition-colors text-lg leading-none"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <p className="text-4xl mb-4">🔔</p>
                  <p className="font-heading text-cacao">No notifications yet</p>
                  <p className="text-ink/40 text-sm mt-2">
                    Order updates, offers and more will appear here
                  </p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {notifications.map((n) => (
                    <NotifCard key={n.id} notif={n} />
                  ))}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
