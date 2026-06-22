"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle } from "lucide-react";
import { useFeed, useToggleLike, type FeedItem } from "@/hooks/use-teas";
import { PhoneFrame } from "@/components/layout/phone-frame";
import { BottomNav } from "@/components/layout/bottom-nav";
import { cn } from "@/lib/utils";

function FeedCard({ item, isAuthed }: { item: FeedItem; isAuthed: boolean }) {
  const router = useRouter();
  const like = useToggleLike(item.id);
  return (
    <Link
      href={`/p/${item.id}`}
      className="block overflow-hidden rounded-[20px] border border-hairline bg-field shadow-[0px_2px_12px_rgba(30,60,35,0.05)]"
    >
      <div className="relative aspect-[4/3]">
        {item.image_url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image_url}
              alt={item.tea_name ?? "차"}
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 bg-paper/25" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-tint-green">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/decor/teacup.svg"
              alt=""
              aria-hidden
              className="absolute left-4 top-4 size-8 opacity-70"
            />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p
            className={cn(
              "truncate text-[15px] font-black",
              item.image_url ? "text-white" : "text-brand-ink",
            )}
          >
            {item.tea_name || "이름 미정"}
          </p>
          <p
            className={cn(
              "truncate text-[12px] font-semibold",
              item.image_url ? "text-white/85" : "text-ink-muted",
            )}
          >
            {item.author ?? "차 애호가"}
            {item.tea_category ? ` · ${item.tea_category}` : ""}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4 px-4 py-2.5">
        <button
          type="button"
          aria-label="좋아요"
          onClick={(e) => {
            e.preventDefault();
            if (!isAuthed) {
              router.push("/login?next=/feed");
              return;
            }
            like.mutate(item.liked_by_me);
          }}
          className="flex items-center gap-1 text-[13px] font-semibold text-ink-muted transition-transform active:scale-90"
        >
          <Heart
            className={cn(
              "size-4 transition-colors",
              item.liked_by_me && "fill-[#d4714a] text-[#d4714a]",
            )}
          />
          {item.like_count}
        </button>
        <span className="flex items-center gap-1 text-[13px] font-semibold text-ink-muted">
          <MessageCircle className="size-4" />
          {item.comment_count}
        </span>
      </div>
    </Link>
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
