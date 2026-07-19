import { verifySession } from "@/lib/dal";
import { adminDb } from "@/lib/firebase/admin";
import type { Notification } from "@/lib/types";
import NotificationsClient from "./NotificationsClient";

async function getNotifications(uid: string): Promise<Notification[]> {
  const snap = await adminDb
    .collection("notifications")
    .doc(uid)
    .collection("items")
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Notification, "id">) }));
}

export default async function NotificationsPage() {
  const session = await verifySession();
  const notifications = await getNotifications(session.uid);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-cacao text-3xl">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-ink/40 text-sm mt-1">{unreadCount} unread</p>
          )}
        </div>
      </div>

      <NotificationsClient notifications={notifications} />
    </div>
  );
}
