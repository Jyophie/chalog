"use client";

import { useState } from "react";
import Link from "next/link";
import { Archive, Camera, Heart, Plus, Search } from "lucide-react";
import { useTeas, useToggleFavorite, type TeaListItem } from "@/hooks/use-teas";
import { TEA_CATEGORIES } from "@/lib/schemas/tea";
import { PhoneFrame } from "@/components/layout/phone-frame";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/utils";

const TINTS = ["bg-tint-green", "bg-tint-cream", "bg-tint-beige", "bg-track"];
const DECOR = [
  "/decor/teacup.svg",
  "/decor/leaf.svg",
  "/decor/star-anise.svg",
  "/decor/pod.svg",
];

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function TeaCard({ tea, index }: { tea: TeaListItem; index: number }) {
  const fav = useToggleFavorite();
  const hasImage = !!tea.image_url;

  return (
    <Link
      href={`/tea/${tea.id}`}
      className="relative block aspect-square overflow-hidden rounded-[20px] shadow-[0px_2px_12px_rgba(30,60,35,0.05)]"
    >
      {hasImage ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={tea.image_url!}
            alt={tea.tea_name ?? "차"}
            className="absolute inset-0 size-full object-cover"
          />
          {/* 부드러운 크림 워시 — 이미지를 연하게 */}
          <div className="absolute inset-0 bg-paper/35" />
          {/* 하단 스크림 — 텍스트 가독성 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        </>
      ) : (
        <div className={cn("absolute inset-0", TINTS[index % TINTS.length])}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/decor/splash.svg"
            alt=""
            aria-hidden
            className="absolute -right-2 top-0 w-24 opacity-25"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={DECOR[index % DECOR.length]}
            alt=""
            aria-hidden
            className="absolute left-4 top-4 size-8"
          />
        </div>
      )}

      {/* 즐겨찾기 토글 */}
      <button
        type="button"
        aria-label="즐겨찾기"
        onClick={(e) => {
          e.preventDefault();
          fav.mutate({ id: tea.id, value: !tea.is_favorite });
        }}
        className={cn(
          "absolute right-2.5 top-2.5 grid size-7 place-items-center rounded-full backdrop-blur-sm transition-colors",
          hasImage ? "bg-black/25" : "bg-paper/70",
        )}
      >
        <Heart
          className={cn(
            "size-3.5",
            tea.is_favorite
              ? "fill-[#d4714a] text-[#d4714a]"
              : hasImage
                ? "text-white"
                : "text-ink-muted",
          )}
        />
      </button>

      {/* 텍스트 */}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p
          className={cn(
            "truncate text-[14px] font-black",
            hasImage ? "text-white" : "text-brand-ink",
          )}
        >
          {tea.tea_name || "이름 미정"}
        </p>
        <div className="mt-1 flex items-center justify-between">
          <span
            className={cn(
              "truncate text-[12px] font-semibold",
              hasImage ? "text-white/85" : "text-ink-muted",
            )}
          >
            {tea.tea_category ?? "종류 미정"}
          </span>
          <span
            className={cn(
              "shrink-0 pl-2 text-[12px] font-semibold tabular-nums",
              hasImage ? "text-white/75" : "text-ink-muted",
            )}
          >
            {fmtDate(tea.created_at)}
          </span>
        </div>
      </div>
    </Link>
  );
}

/** ⑧ 내 티 아카이브 */
export default function ArchivePage() {
  const { data: teas, isLoading, isError } = useTeas();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("전체");
  const [favOnly, setFavOnly] = useState(false);

  const filtered = (teas ?? []).filter((t) => {
    if (favOnly && !t.is_favorite) return false;
    if (cat !== "전체" && t.tea_category !== cat) return false;
    if (query && !(t.tea_name ?? "").toLowerCase().includes(query.toLowerCase()))
      return false;
    return true;
  });

  return (
    <PhoneFrame scroll={false}>
      <div className="relative flex min-h-0 flex-1 flex-col">
        {/* 헤더 (고정) */}
        <header className="px-6 pt-14 pb-2">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[24px] font-black text-brand-ink">
                내 티 아카이브
              </h1>
              <p className="mt-0.5 text-[14px] text-ink-muted">
                {teas ? `${teas.length}종 수집 중` : "불러오는 중"} · 오늘도 한 잔 🍵
              </p>
            </div>
            <Link
              href="/upload"
              aria-label="차 등록"
              className="grid size-12 shrink-0 place-items-center rounded-full bg-brand text-white shadow-[0px_4px_8px_rgba(74,124,89,0.31)] transition-colors hover:bg-brand-dark"
            >
              <Plus className="size-5" />
            </Link>
          </div>

          {/* 검색 */}
          <div className="relative mt-4">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="차 이름으로 검색..."
              className="h-[46px] w-full rounded-[16px] border border-hairline bg-field pl-10 pr-4 text-[14px] text-brand-ink outline-none transition-colors placeholder:text-[#1e2b2080] focus:border-brand"
            />
          </div>

          {/* 카테고리 필터 */}
          <div className="-mx-6 mt-3.5 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {["전체", ...TEA_CATEGORIES].map((c) => (
              <Chip
                key={c}
                selected={cat === c}
                onClick={() => setCat(c)}
                className="shrink-0"
              >
                {c}
              </Chip>
            ))}
          </div>
        </header>

        {/* 목록 (스크롤) */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-28 pt-3">
          {isLoading && (
            <div className="grid grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-square animate-pulse rounded-[20px] bg-tint-green/50"
                />
              ))}
            </div>
          )}

          {isError && !teas && (
            <p className="mt-10 text-center text-[14px] text-red-500">
              목록을 불러오지 못했어요.
            </p>
          )}

          {teas && teas.length === 0 && (
            <div className="mt-16 flex flex-col items-center gap-4 text-center">
              <span className="text-5xl">🫖</span>
              <div>
                <p className="text-[15px] font-bold text-brand-ink">
                  아직 저장한 차가 없어요
                </p>
                <p className="mt-1 text-[13px] text-ink-muted">
                  첫 차를 등록하고 가이드를 받아보세요.
                </p>
              </div>
              <Link
                href="/upload"
                className="mt-1 rounded-pill bg-brand px-6 py-3 text-[14px] font-bold text-white shadow-brand"
              >
                첫 차 등록하기
              </Link>
            </div>
          )}

          {teas && teas.length > 0 && filtered.length === 0 && (
            <p className="mt-16 text-center text-[14px] text-ink-muted">
              조건에 맞는 차가 없어요.
            </p>
          )}

          {filtered.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((t, i) => (
                <TeaCard key={t.id} tea={t} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* 하단 내비 */}
        <nav className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-4">
          <div className="pointer-events-auto flex items-center justify-around rounded-[24px] border border-hairline bg-field py-3 shadow-[0px_-2px_10px_rgba(30,60,35,0.09)]">
            <div className="flex flex-col items-center gap-1">
              <span className="grid size-10 place-items-center rounded-[16px] bg-tint-green">
                <Archive className="size-5 text-brand" />
              </span>
              <span className="text-[12px] font-bold text-brand">아카이브</span>
            </div>
            <Link href="/upload" className="flex flex-col items-center gap-1">
              <span className="grid size-10 place-items-center rounded-[16px] bg-brand">
                <Camera className="size-5 text-white" />
              </span>
              <span className="text-[12px] text-ink-muted">등록</span>
            </Link>
            <button
              type="button"
              onClick={() => setFavOnly((v) => !v)}
              className="flex flex-col items-center gap-1"
            >
              <span
                className={cn(
                  "grid size-10 place-items-center rounded-[16px]",
                  favOnly ? "bg-tint-green" : "bg-transparent",
                )}
              >
                <Heart
                  className={cn(
                    "size-5",
                    favOnly
                      ? "fill-[#d4714a] text-[#d4714a]"
                      : "text-ink-muted",
                  )}
                />
              </span>
              <span
                className={cn(
                  "text-[12px]",
                  favOnly ? "font-bold text-brand" : "text-ink-muted",
                )}
              >
                즐겨찾기
              </span>
            </button>
          </div>
        </nav>
      </div>
    </PhoneFrame>
  );
}
