"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Plus, Star, Trash2 } from "lucide-react";
import {
  useTea,
  useDeleteTea,
  useToggleFavorite,
} from "@/hooks/use-teas";
import { TopBar } from "@/components/layout/top-bar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between border-b border-border/60 py-2 last:border-0">
      <span className="text-sm text-ink-muted">{label}</span>
      <span className="text-sm font-semibold text-brand-ink">{value}</span>
    </div>
  );
}

/** ⑨ 차 상세 */
export default function TeaDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useTea(id);
  const del = useDeleteTea();
  const fav = useToggleFavorite();

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[420px]">
        <TopBar />
        <div className="px-6">
          <div className="aspect-[4/3] animate-pulse rounded-[20px] bg-tint-green/40" />
        </div>
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div className="mx-auto w-full max-w-[420px]">
        <TopBar />
        <p className="mt-20 text-center text-sm text-red-500">
          차 정보를 불러오지 못했어요.
        </p>
      </div>
    );
  }

  const { tea, guide, logs } = data;

  async function onDelete() {
    if (!confirm("이 차를 삭제할까요? 기록도 함께 사라져요.")) return;
    await del.mutateAsync(id);
    router.replace("/archive");
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col">
      <TopBar
        onBack={() => router.push("/archive")}
        right={
          <button
            type="button"
            aria-label="즐겨찾기"
            onClick={() => fav.mutate({ id, value: !tea.is_favorite })}
            className={cn(
              "transition-colors",
              tea.is_favorite ? "text-amber-400" : "text-ink-muted",
            )}
          >
            <Star className={cn("size-5", tea.is_favorite && "fill-current")} />
          </button>
        }
      />

      <main className="flex flex-1 flex-col px-6 pb-10">
        {tea.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tea.image_url}
            alt={tea.tea_name ?? "차"}
            className="aspect-[4/3] w-full rounded-[20px] object-cover"
          />
        )}

        <h1 className="mt-4 font-display text-2xl font-black text-brand-ink">
          {tea.tea_name || "이름 미정"}
        </h1>
        {tea.tea_category && (
          <span className="mt-1 w-fit rounded-full bg-tint-green px-2.5 py-1 text-xs font-bold text-brand">
            {tea.tea_category}
          </span>
        )}

        {tea.ai_summary && (
          <p className="mt-4 rounded-card bg-tint-green/40 p-4 text-sm leading-relaxed text-brand-ink">
            {tea.ai_summary}
          </p>
        )}

        <div className="mt-4 rounded-card border border-border bg-surface px-4">
          <InfoRow label="브랜드" value={tea.brand} />
          <InfoRow label="산지" value={tea.origin} />
          <InfoRow label="생산연도" value={tea.production_year} />
          <InfoRow label="찻잎 형태" value={tea.leaf_shape} />
          <InfoRow label="도구" value={tea.brewing_tool} />
        </div>

        {/* 우리는 가이드 */}
        {guide && (
          <section className="mt-6">
            <h2 className="mb-2 font-display text-base font-bold text-brand-ink">
              우리는 가이드
            </h2>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="rounded-card bg-tint-green/50 py-3">
                <p className="text-ink-muted">물 온도</p>
                <p className="font-bold text-brand-ink">{guide.water_temperature}</p>
              </div>
              <div className="rounded-card bg-tint-green/50 py-3">
                <p className="text-ink-muted">차 양</p>
                <p className="font-bold text-brand-ink">{guide.tea_amount}</p>
              </div>
              <div className="rounded-card bg-tint-green/50 py-3">
                <p className="text-ink-muted">우림 시간</p>
                <p className="font-bold text-brand-ink">{guide.steeping_time}</p>
              </div>
              <div className="rounded-card bg-tint-green/50 py-3">
                <p className="text-ink-muted">도구</p>
                <p className="font-bold text-brand-ink">{guide.recommended_tool}</p>
              </div>
            </div>
            {guide.guide_text && (
              <p className="mt-3 whitespace-pre-line rounded-card border border-border bg-surface p-4 text-sm leading-relaxed text-brand-ink">
                {guide.guide_text}
              </p>
            )}
            {guide.adjustment_tips && (
              <p className="mt-2 whitespace-pre-line rounded-card bg-tint-cream/60 p-4 text-sm leading-relaxed text-brand-ink">
                💡 {guide.adjustment_tips}
              </p>
            )}
          </section>
        )}

        {/* 마신 기록 */}
        <section className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-brand-ink">
              마신 기록 {logs.length > 0 && `(${logs.length})`}
            </h2>
            <Link
              href={`/tea/${id}/log`}
              className={cn(buttonVariants({ size: "sm" }), "gap-1")}
            >
              <Plus className="size-4" /> 기록
            </Link>
          </div>

          {logs.length === 0 ? (
            <p className="rounded-card bg-tint-beige/40 p-4 text-center text-sm text-ink-muted">
              아직 기록이 없어요. 차를 마신 뒤 남겨보세요.
            </p>
          ) : (
            <ul className="space-y-2">
              {logs.map((log) => (
                <li
                  key={log.id}
                  className="rounded-card border border-border bg-surface p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-brand-ink">
                      {log.brewed_at}
                    </span>
                    {log.rating != null && (
                      <span className="text-xs text-amber-400">
                        {"★".repeat(log.rating)}
                        <span className="text-border">
                          {"★".repeat(5 - log.rating)}
                        </span>
                      </span>
                    )}
                  </div>
                  {log.taste_memo && (
                    <p className="mt-1 text-sm text-ink-muted">맛 · {log.taste_memo}</p>
                  )}
                  {log.aroma_memo && (
                    <p className="text-sm text-ink-muted">향 · {log.aroma_memo}</p>
                  )}
                  {log.next_adjustment && (
                    <p className="mt-1 text-xs text-brand">
                      다음엔 · {log.next_adjustment}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <button
          type="button"
          onClick={onDelete}
          disabled={del.isPending}
          className="mt-8 flex items-center justify-center gap-1.5 text-sm text-ink-muted hover:text-red-500"
        >
          <Trash2 className="size-4" /> 차 삭제하기
        </button>
      </main>
    </div>
  );
}
