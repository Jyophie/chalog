"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Reply, UserPlus } from "lucide-react";
import {
  useNotifications,
  useMarkNotificationsRead,
  type NotificationItem,
} from "@/hooks/use-teas";
import { PhoneFrame } from "@/components/layout/phone-frame";
import { TopBar } from "@/components/layout/top-bar";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function relTime(iso: string) {
  const diff = (new Date().getTime() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "방금";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
  const d = new Date(iso);
  return `${d.getMonth() + 1}.${d.getDate()}`;
}

function line(n: NotificationItem) {
  const who = n.actor ?? "누군가";
  const tea = n.tea_name ? `‘${n.tea_name}’ ` : "";
  if (n.type === "like") return `${who}님이 ${tea}기록을 좋아해요`;
  if (n.type === "comment") return `${who}님이 ${tea}기록에 댓글을 남겼어요`;
  if (n.type === "follow") return `${who}님이 회원님을 팔로우해요`;
  return `${who}님이 회원님의 댓글에 답글을 남겼어요`;
}

function href(n: NotificationItem) {
  if (n.type === "follow") return `/u/${n.actor_id}`;
  return n.log_id ? `/p/${n.log_id}` : `/u/${n.actor_id}`;
}

function TypeIcon({ type }: { type: NotificationItem["type"] }) {
  if (type === "like")
    return <Heart className="size-3.5 fill-[#d4714a] text-[#d4714a]" />;
  if (type === "comment") return <MessageCircle className="size-3.5 text-brand" />;
  if (type === "follow") return <UserPlus className="size-3.5 text-brand" />;
  return <Reply className="size-3.5 text-brand" />;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { data, isLoading } = useNotifications(true);
  const markRead = useMarkNotificationsRead();
  const items = data?.items ?? [];

  // 진입 시 모두 읽음 처리
  useEffect(() => {
    if ((data?.unread ?? 0) > 0) markRead.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.unread]);

  return (
    <PhoneFrame>
      <TopBar title="알림" onBack={() => router.back()} />
      <main className="flex flex-1 flex-col px-4 pt-1 pb-10">
        {isLoading && (
          <div className="flex flex-col gap-2 px-2 pt-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-[14px] bg-tint-green/50"
              />
            ))}
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <div className="mt-24 flex flex-col items-center gap-3 text-center">
            <span className="text-5xl">🔔</span>
            <p className="text-[14px] text-ink-muted">아직 알림이 없어요.</p>
          </div>
        )}

        <ul className="flex flex-col">
          {items.map((n) => (
            <li key={n.id}>
              <Link
                href={href(n)}
                className={cn(
                  "flex items-center gap-3 rounded-[14px] px-3 py-3 transition-colors hover:bg-tint-green/30",
                  !n.read && "bg-tint-green/40",
                )}
              >
                <div className="relative shrink-0">
                  <Avatar
                    src={n.actor_avatar}
                    name={n.actor}
                    className="size-11"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 grid size-5 place-items-center rounded-full border-2 border-paper bg-field">
                    <TypeIcon type={n.type} />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] leading-snug text-brand-ink">
                    {line(n)}
                  </p>
                  {n.comment_body && (
                    <p className="mt-0.5 truncate text-[12px] text-ink-muted">
                      “{n.comment_body}”
                    </p>
                  )}
                  <p className="mt-0.5 text-[11px] text-ink-muted">
                    {relTime(n.created_at)}
                  </p>
                </div>
                {!n.read && (
                  <span className="size-2 shrink-0 rounded-full bg-[#d4714a]" />
                )}
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </PhoneFrame>
  );
}
