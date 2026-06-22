"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Leaf, MessageCircle } from "lucide-react";
import { useFeed, useToggleLike, type FeedItem } from "@/hooks/use-teas";
import { PhoneFrame } from "@/components/layout/phone-frame";
import { BottomNav } from "@/components/layout/bottom-nav";
import { PhotoCarousel } from "@/components/photo-carousel";
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

  const hasDetails =
    !!item.aroma_memo ||
    !!item.water_temperature ||
    !!item.steeping_time ||
    !!item.tea_amount ||
    !!item.tool ||
    !!item.next_adjustment ||
    (item.taste_memo?.length ?? 0) > 60;

  return (
    <article className="overflow-hidden rounded-[20px] border border-hairline bg-field shadow-[0px_2px_12px_rgba(30,60,35,0.05)]">
      {/* 작성자 헤더 */}
      <Link href={`/p/${item.id}`} className="flex items-center gap-2.5 px-4 py-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand text-[14px] font-black text-white">
          {(item.author || "?").charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-bold text-brand-ink">
            {item.author ?? "차 애호가"}
          </p>
          <p className="truncate text-[12px] text-ink-muted">
            {item.tea_name || "이름 미정"}
            {item.tea_category ? ` · ${item.tea_category}` : ""}
          </p>
        </div>
        <span className="shrink-0 text-[12px] text-ink-muted">
          {item.brewed_at}
        </span>
      </Link>

      {/* 사진 (필터 없음) */}
      <PhotoCarousel images={item.images} />

      {/* 액션 */}
      <div className="flex items-center gap-4 px-4 pt-3">
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
          className="flex items-center gap-1 text-[14px] font-semibold text-ink-muted transition-transform active:scale-90"
        >
          <Heart
            className={cn(
              "size-5 transition-colors",
              item.liked_by_me && "fill-[#d4714a] text-[#d4714a]",
            )}
          />
          {item.like_count}
        </button>
        <Link
          href={`/p/${item.id}`}
          className="flex items-center gap-1 text-[14px] font-semibold text-ink-muted"
        >
          <MessageCircle className="size-5" />
          {item.comment_count}
        </Link>
      </div>

      {/* 텍스트 정보 (일부 → 더보기로 전체) */}
      <div className="px-4 pb-4 pt-2">
        {item.rating != null && <LeafRating value={item.rating} />}

        {item.taste_memo && (
          <p
            className={cn(
              "mt-1.5 text-[13px] leading-relaxed text-brand-ink",
              !expanded && "line-clamp-2",
            )}
          >
            <span className="font-bold">{item.author ?? "차 애호가"} </span>
            {item.taste_memo}
          </p>
        )}

        {expanded && (
          <div className="mt-2 flex flex-col gap-2">
            {(item.water_temperature ||
              item.steeping_time ||
              item.tea_amount ||
              item.tool) && (
              <div className="flex flex-wrap gap-1.5">
                <Cond label="🌡️" value={item.water_temperature} />
                <Cond label="⏱️" value={item.steeping_time} />
                <Cond label="🍃" value={item.tea_amount} />
                <Cond label="🫖" value={item.tool} />
              </div>
            )}
            {item.aroma_memo && (
              <p className="text-[13px] leading-relaxed text-brand-ink">
                <span className="font-bold text-ink-muted">향 · </span>
                {item.aroma_memo}
              </p>
            )}
            {item.next_adjustment && (
              <p className="text-[12px] font-semibold text-brand">
                다음엔 · {item.next_adjustment}
              </p>
            )}
          </div>
        )}

        {hasDetails && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 text-[12px] font-semibold text-ink-muted"
          >
            {expanded ? "접기" : "더보기"}
          </button>
        )}

        {item.comment_count > 0 && (
          <Link
            href={`/p/${item.id}`}
            className="mt-2 block text-[12px] text-ink-muted"
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
  const { data, isLoading, isError } = useFeed();
  const items = data?.items;
  const isAuthed = data?.is_authed ?? false;

  return (
    <PhoneFrame scroll={false}>
      <div className="relative flex min-h-0 flex-1 flex-col">
        <header className="px-6 pt-14 pb-3">
          <h1 className="text-[24px] font-black text-brand-ink">피드</h1>
          <p className="mt-0.5 text-[14px] text-ink-muted">
            다른 사람들의 차 기록을 둘러봐요 🍃
          </p>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-28 pt-1">
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

          {items && items.length === 0 && (
            <div className="mt-16 flex flex-col items-center gap-3 text-center">
              <span className="text-5xl">🍵</span>
              <p className="text-[14px] text-ink-muted">
                아직 공개된 기록이 없어요.
                <br />첫 공개 기록의 주인공이 되어보세요!
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
        </div>

        <BottomNav active="feed" />
      </div>
    </PhoneFrame>
  );
}
