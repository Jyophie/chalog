"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/use-teas";

/** 알림 벨 + 안 읽은 수 배지 (로그인 시에만) */
export function NotificationBell({ enabled }: { enabled: boolean }) {
  const { data } = useNotifications(enabled);
  if (!enabled) return null;
  const unread = data?.unread ?? 0;
  return (
    <Link
      href="/notifications"
      aria-label="알림"
      className="relative grid size-9 place-items-center rounded-full text-ink-muted transition-colors hover:bg-track hover:text-brand-ink"
    >
      <Bell className="size-5" />
      {unread > 0 && (
        <span className="absolute right-0.5 top-0.5 grid h-[15px] min-w-[15px] place-items-center rounded-full bg-[#d4714a] px-1 text-[9px] font-black text-white">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
