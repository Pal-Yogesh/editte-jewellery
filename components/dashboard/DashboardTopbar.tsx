import Link from "next/link";
import { getCurrentUser, verifySession } from "@/lib/dal";
import { adminDb } from "@/lib/firebase/admin";
import type { Notification } from "@/lib/types";
import MobileNav from "./MobileNav";
import NotificationsBell from "./NotificationsBell";

async function getNotifications(uid: string): Promise<Notification[]> {
  try {
    const snap = await adminDb
      .collection("notifications")
      .doc(uid)
      .collection("items")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Notification, "id">),
    }));
  } catch {
    return [];
  }
}

export default async function DashboardTopbar() {
  const [user, session] = await Promise.all([getCurrentUser(), verifySession()]);
  const notifications = await getNotifications(session.uid);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-salt border-b border-ink/10 px-5 py-4 flex items-center justify-between">
      {/* Mobile hamburger + logo */}
      <div className="flex items-center gap-4 lg:hidden">
        <MobileNav />
        <Link href="/" className="font-heading text-cacao text-lg tracking-[0.2em] uppercase">
          editte
        </Link>
      </div>

      {/* Desktop: empty left space */}
      <div className="hidden lg:block" />

      {/* Right — notifications bell + user avatar */}
      <div className="flex items-center gap-4">
        {/* Bell opens drawer instead of navigating to a page */}
        <NotificationsBell notifications={notifications} unread={unread} />

        <Link href="/dashboard/settings" className="flex items-center gap-2 group">
          {user?.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.photoURL}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border border-ink/10"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-cacao text-white text-xs flex items-center justify-center font-heading uppercase">
              {(user?.name ?? "U").charAt(0)}
            </div>
          )}
          <span className="hidden sm:block text-sm text-ink/70 group-hover:text-cacao transition-colors truncate max-w-[120px]">
            {user?.name ?? "Account"}
          </span>
        </Link>
      </div>
    </header>
  );
}
