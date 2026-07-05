"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Leaf, MessageCircle } from "lucide-react";
import { useFeed, useToggleLike, type FeedItem } from "@/hooks/use-teas";
import { PhoneFrame } from "@/components/layout/phone-frame";
import { BottomNav } from "@/components/layout/bottom-nav";
import { TabHeader } from "@/components/layout/tab-header";
import { NotificationBell } from "@/components/notification-bell";
import { PhotoCarousel } from "@/components/photo-carousel";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function LeafRating({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Leaf
          key={n}
          className={cn(
            "size-3",
            n <= value ? "fill-brand text-brand" : "text-ink-muted/30",
          )}
        />
      ))}
    </div>
  );
}

function Cond({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <span className="rounded-full bg-tint-green px-2.5 py-1 text-[11px] font-semibold text-mark">
      {label} {value}
    </span>
  );
}

function FeedCard({ item, isAuthed }: { item: FeedItem; isAuthed: boolean }) {
  const router = useRouter();
  const like = useToggleLike(item.id);
  const [expanded, setExpanded] = useState(false);

  const note = item.next_adjustment;
  const caption = note ?? item.taste_memo ?? "";
  const showTasteInExpand = !!note && !!item.taste_memo;
  const hasConditions = !!(
    item.water_temperature ||
    item.steeping_time ||
    item.tea_amount ||
    item.tool
  );
  const hasMore =
    showTasteInExpand ||
    !!item.aroma_memo ||
    hasConditions ||
    caption.length > 28 ||
    caption.includes("\n");

  return (
    <article className="overflow-hidden rounded-[20px] border border-hairline bg-field shadow-[0px_2px_12px_rgba(30,60,35,0.05)]">
      {/* 작성자 헤더 — 작성자 영역 탭 시 프로필로 */}
      <div className="flex items-center gap-2.5 px-4 py-3">
        <Link
          href={item.author_id ? `/u/${item.author_id}` : `/p/${item.id}`}
          className="flex min-w-0 flex-1 items-center gap-2.5"
        >
          <Avatar src={item.author_avatar} name={item.author} className="size-9" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-bold text-brand-ink">
              {item.author ?? "차 애호가"}
            </p>
            <p className="truncate text-[12px] text-ink-muted">
              {item.tea_name || "이름 미정"}
              {item.tea_category ? ` · ${item.tea_category}` : ""}
            </p>
          </div>
        </Link>
        <span className="shrink-0 text-[12px] text-ink-muted">
          {item.brewed_at}
        </span>
      </div>

      {/* 사진 (필터 없음) */}
      <PhotoCarousel images={item.images} />

      {/* 액션 */}
      <div className="flex items-center justify-between px-4 pt-3.5">
        <div className="flex items-center gap-5">
          <button
            type="button"
            aria-label="좋아요"
            onClick={() => {
              if (!isAuthed) {
                router.push("/login?next=/feed");
                return;
              }
              like.mutate(item.liked_by_me);
            }}
            className="flex items-center gap-1.5 text-[14px] font-semibold text-ink-muted transition-transform active:scale-90"
          >
            <Heart
              className={cn(
                "size-[22px] transition-colors",
                item.liked_by_me && "fill-[#d4714a] text-[#d4714a]",
              )}
            />
            {item.like_count}
          </button>
          <Link
            href={`/p/${item.id}`}
            className="flex items-center gap-1.5 text-[14px] font-semibold text-ink-muted"
          >
            <MessageCircle className="size-[22px]" />
            {item.comment_count}
          </Link>
        </div>
        {item.rating != null && <LeafRating value={item.rating} />}
      </div>

      {/* 텍스트 — 노트가 캡션, 나머지는 더보기 */}
      <div className="px-4 pb-4 pt-2.5">
        {caption && (
          <p
            className={cn(
              "whitespace-pre-wrap text-[14px] leading-relaxed text-brand-ink",
              !expanded && "line-clamp-1",
            )}
          >
            {caption}
          </p>
        )}

        {expanded && (
          <div className="mt-3 flex flex-col gap-2.5">
            {showTasteInExpand && (
              <p className="text-[13px] leading-relaxed text-brand-ink">
                <span className="font-bold text-ink-muted">맛 · </span>
                {item.taste_memo}
              </p>
            )}
            {item.aroma_memo && (
              <p className="text-[13px] leading-relaxed text-brand-ink">
                <span className="font-bold text-ink-muted">향 · </span>
                {item.aroma_memo}
              </p>
            )}
            {hasConditions && (
              <div className="flex flex-wrap gap-1.5">
                <Cond label="🌡️" value={item.water_temperature} />
                <Cond label="⏱️" value={item.steeping_time} />
                <Cond label="🍃" value={item.tea_amount} />
                <Cond label="🫖" value={item.tool} />
              </div>
            )}
          </div>
        )}

        {hasMore && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 text-[13px] font-semibold text-ink-muted"
          >
            {expanded ? "접기" : "더보기"}
          </button>
        )}

        {item.comment_count > 0 && (
          <Link
            href={`/p/${item.id}`}
            className="mt-3 block text-[13px] text-ink-muted"
          >
            댓글 {item.comment_count}개 모두 보기
          </Link>
        )}
      </div>
    </article>
  );
}

/** 피드 — 공개 기록 모음 */
export default function FeedPage() {
  const [scope, setScope] = useState<"all" | "following">("all");
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeed(scope);
  const items = data?.pages.flatMap((p) => p.items);
  const isAuthed = data?.pages[0]?.is_authed ?? false;

  // 무한스크롤 센티넬
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <PhoneFrame scroll={false}>
      <div className="relative flex min-h-0 flex-1 flex-col">
        <TabHeader
          title="피드"
          subtitle="다른 사람들의 차 기록"
          action={<NotificationBell enabled={isAuthed} />}
        />

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-28 pt-1">
          {isAuthed && (
            <div className="mb-4 flex gap-1 rounded-[14px] bg-track p-1">
              {(["all", "following"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScope(s)}
                  className={cn(
                    "flex-1 rounded-[10px] py-2 text-[13px] font-bold transition-colors",
                    scope === s
                      ? "bg-field text-brand-ink shadow-[0px_1px_3px_rgba(30,60,35,0.1)]"
                      : "text-ink-muted",
                  )}
                >
                  {s === "all" ? "전체" : "팔로잉"}
                </button>
              ))}
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col gap-4">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="aspect-[4/3] animate-pulse rounded-[20px] bg-tint-green/50"
                />
              ))}
            </div>
          )}

          {isError && (
            <p className="mt-10 text-center text-[14px] text-red-500">
              피드를 불러오지 못했어요.
            </p>
          )}

          {items && items.length === 0 && scope === "all" && (
            <div className="mt-16 flex flex-col items-center gap-3 text-center">
              <span className="text-5xl">🍵</span>
              <p className="text-[14px] text-ink-muted">
                아직 공개된 기록이 없어요.
                <br />첫 공개 기록의 주인공이 되어보세요!
              </p>
            </div>
          )}

          {items && items.length === 0 && scope === "following" && (
            <div className="mt-16 flex flex-col items-center gap-3 text-center">
              <span className="text-5xl">👀</span>
              <p className="text-[14px] text-ink-muted">
                팔로우한 사람의 공개 기록이 여기 모여요.
                <br />
                마음에 드는 기록의 작성자를 팔로우해보세요.
              </p>
            </div>
          )}

          {items && items.length > 0 && (
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <FeedCard key={item.id} item={item} isAuthed={isAuthed} />
              ))}
            </div>
          )}

          {/* 무한스크롤 트리거 */}
          <div ref={sentinelRef} className="h-1" />
          {isFetchingNextPage && (
            <p className="py-6 text-center text-[13px] text-ink-muted">
              불러오는 중…
            </p>
          )}
          {items && items.length > 0 && !hasNextPage && (
            <p className="py-6 text-center text-[12px] text-ink-muted">
              마지막 기록까지 봤어요 🍃
            </p>
          )}
        </div>

        <BottomNav active="feed" />
      </div>
    </PhoneFrame>
  );
}
