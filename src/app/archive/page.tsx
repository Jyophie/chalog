"use client";

import Link from "next/link";
import { Plus, Star } from "lucide-react";
import { useTeas, type TeaListItem } from "@/hooks/use-teas";
import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function TeaCard({ tea }: { tea: TeaListItem }) {
  return (
    <Link
      href={`/tea/${tea.id}`}
      className="group flex flex-col overflow-hidden rounded-[18px] border border-border bg-surface"
    >
      <div className="relative aspect-square bg-tint-green/40">
        {tea.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tea.image_url}
            alt={tea.tea_name ?? "차"}
            className="size-full object-cover"
          />
        ) : (
          <div className="grid size-full place-items-center text-3xl">🍵</div>
        )}
        {tea.is_favorite && (
          <span className="absolute right-2 top-2 text-amber-400">
            <Star className="size-4 fill-current" />
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-bold text-brand-ink">
          {tea.tea_name || "이름 미정"}
        </p>
        <p className="mt-0.5 text-xs text-ink-muted">
          {tea.tea_category ?? "종류 미정"}
        </p>
      </div>
    </Link>
  );
}

/** ⑧ 내 차 아카이브 */
export default function ArchivePage() {
  const { data: teas, isLoading, isError } = useTeas();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col">
      <header className="flex items-center justify-between px-6 pb-2 pt-6">
        <Logo size="sm" withTagline={false} />
        <Link
          href="/upload"
          className={cn(buttonVariants({ size: "sm" }), "gap-1")}
        >
          <Plus className="size-4" /> 차 등록
        </Link>
      </header>

      <main className="flex flex-1 flex-col px-6 pb-10">
        <h1 className="mb-4 mt-2 font-display text-xl font-black text-brand-ink">
          내 차 보관함
        </h1>

        {isLoading && (
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse rounded-[18px] bg-tint-green/40"
              />
            ))}
          </div>
        )}

        {isError && (
          <p className="mt-10 text-center text-sm text-red-500">
            목록을 불러오지 못했어요.
          </p>
        )}

        {teas && teas.length === 0 && (
          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <span className="text-5xl">🫖</span>
            <div>
              <p className="font-display text-base font-bold text-brand-ink">
                아직 저장한 차가 없어요
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                첫 차를 등록하고 가이드를 받아보세요.
              </p>
            </div>
            <Link
              href="/upload"
              className={cn(buttonVariants({ size: "md" }), "mt-2")}
            >
              첫 차 등록하기
            </Link>
          </div>
        )}

        {teas && teas.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {teas.map((t) => (
              <TeaCard key={t.id} tea={t} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
