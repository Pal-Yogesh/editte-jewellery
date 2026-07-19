"use client";
import { useActionState } from "react";
import { markNotificationReadAction, markAllReadAction } from "@/app/actions/notifications";
import type { Notification } from "@/lib/types";

const TYPE_ICONS: Record<Notification["type"], string> = {
  order: "📦",
  wishlist: "♡",
  promo: "✦",
  account: "⚙",
};

function NotifCard({ notif }: { notif: Notification }) {
  const [, action] = useActionState(markNotificationReadAction, undefined);
  return (
    <div className={`flex gap-4 p-4 rounded-xl border transition-colors ${notif.read ? "bg-white border-ink/5" : "bg-sand/30 border-sand"}`}>
      <span className="text-xl shrink-0 mt-0.5">{TYPE_ICONS[notif.type]}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${notif.read ? "text-ink/70" : "font-heading text-cacao"}`}>{notif.title}</p>
        <p className="text-xs text-ink/50 mt-0.5 leading-relaxed">{notif.message}</p>
        <p className="text-xs text-ink/30 mt-1">
          {new Date(notif.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      </div>
      {!notif.read && (
        <form action={action}>
          <input type="hidden" name="id" value={notif.id} />
          <button type="submit" className="text-xs text-ink/30 hover:text-cacao underline transition-colors shrink-0">
            Mark read
          </button>
        </form>
      )}
    </div>
  );
}

function MarkAllReadButton({ unread }: { unread: number }) {
  const [, action, pending] = useActionState(markAllReadAction, undefined);
  if (unread === 0) return null;
  return (
    <div className="flex justify-end">
      <form action={action}>
        <button type="submit" disabled={pending} className="text-xs text-cacao underline hover:text-sage transition-colors disabled:opacity-50">
          {pending ? "Marking…" : "Mark all as read"}
        </button>
      </form>
    </div>
  );
}

export default function NotificationsClient({ notifications }: { notifications: Notification[] }) {
  const unread = notifications.filter((n) => !n.read).length;

  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-ink/5 px-6 py-16 text-center">
        <p className="text-4xl mb-4">🔔</p>
        <p className="font-heading text-cacao">No notifications yet</p>
        <p className="text-ink/40 text-sm mt-2">Order updates, offers and more will appear here</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <MarkAllReadButton unread={unread} />
      {notifications.map((n) => <NotifCard key={n.id} notif={n} />)}
    </div>
  );
}
