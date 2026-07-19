"use client";
import { useState } from "react";
import NotificationsDrawer from "./NotificationsDrawer";
import type { Notification } from "@/lib/types";

interface Props {
  notifications: Notification[];
  unread: number;
}

export default function NotificationsBell({ notifications, unread }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative text-ink/50 hover:text-cacao transition-colors text-lg"
        aria-label="Open notifications"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose text-white text-[9px] rounded-full flex items-center justify-center font-heading">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <NotificationsDrawer
        open={open}
        onClose={() => setOpen(false)}
        notifications={notifications}
        unread={unread}
      />
    </>
  );
}
