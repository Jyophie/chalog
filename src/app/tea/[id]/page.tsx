"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Globe,
  Heart,
  Leaf,
  Lock,
  MessageCircle,
  Pencil,
  Plus,
  ScrollText,
  Thermometer,
  Timer,
  Trash2,
} from "lucide-react";
import {
  useTea,
  useDeleteTea,
  useToggleFavorite,
  useToggleLogPublic,
  useDeleteLog,
} from "@/hooks/use-teas";
import { PhoneFrame } from "@/components/layout/phone-frame";
import { BrewTimer, derivePours } from "@/components/brew-timer";
import { cn } from "@/lib/utils";

/** 평점 잎 5개 */
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

function GuideRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 border-b border-hairline py-2.5 last:border-0">
      <span className="w-20 shrink-0 text-[12px] font-bold text-ink-muted">
        {label}
      </span>
      <span className="flex-1 text-[14px] font-semibold text-brand-ink">
        {value}
      </span>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1.5 rounded-[20px] border border-hairline bg-field p-3 text-center shadow-[0px_2px_6px_rgba(30,60,35,0.05)]">
      <span className="text-brand">{icon}</span>
      <span className="flex flex-1 items-center text-[14px] font-black leading-tight text-brand-ink">
        {value}
      </span>
      <span className="text-[12px] text-ink-muted">{label}</span>
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
  const togglePublic = useToggleLogPublic(id);
  const delLog = useDeleteLog(id);
  const [deletingLog, setDeletingLog] = useState<string | null>(null);
  const [tab, setTab] = useState<"guide" | "logs">("guide");

  if (isLoading) {
    return (
      <PhoneFrame>
        <div className="px-6 pt-14">
          <div className="h-24 w-full animate-pulse rounded-[24px] bg-tint-green/50" />
        </div>
      </PhoneFrame>
    );
  }
  if (isError || !data) {
    return (
      <PhoneFrame>
        <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <span className="text-5xl">🫖</span>
          <p className="text-[14px] text-red-500">차 정보를 불러오지 못했어요.</p>
          <button
            type="button"
            onClick={() => router.push("/archive")}
            className="rounded-pill border border-hairline bg-field px-5 py-2.5 text-[14px] font-bold text-brand-ink"
          >
            아카이브로
          </button>
        </main>
      </PhoneFrame>
    );
  }

  const { tea, guide, logs, is_owner } = data;
  const rated = logs.filter((l) => l.rating != null);
  const avg = rated.length
    ? Math.round(rated.reduce((s, l) => s + (l.rating ?? 0), 0) / rated.length)
    : 0;
  const subtitle = [tea.origin, tea.production_year].filter(Boolean).join(" · ");

  async function onDelete() {
    if (!confirm("이 차를 삭제할까요? 기록도 함께 사라져요.")) return;
    await del.mutateAsync(id);
    router.replace("/archive");
  }

  return (
    <PhoneFrame>
      {/* 헤더 */}
      <div className="relative border-b border-hairline px-6 pt-14 pb-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/archive")}
            aria-label="뒤로"
            className="grid size-10 place-items-center rounded-full bg-track text-brand-ink transition-colors hover:bg-[#e3ddd0]"
          >
            <ArrowLeft className="size-[18px]" />
          </button>
          {is_owner && (
            <div className="flex items-center gap-2">
              <Link
                href={`/tea/${id}/edit`}
                aria-label="정보 수정"
                className="grid size-10 place-items-center rounded-full bg-track text-brand-ink transition-colors hover:bg-[#e3ddd0]"
              >
                <Pencil className="size-[17px]" />
              </Link>
              <button
                type="button"
                aria-label="즐겨찾기"
                onClick={() => fav.mutate({ id, value: !tea.is_favorite })}
                className="grid size-10 place-items-center rounded-full bg-track transition-colors hover:bg-[#e3ddd0]"
              >
                <Heart
                  className={cn(
                    "size-[18px]",
                    tea.is_favorite
                      ? "fill-[#d4714a] text-[#d4714a]"
                      : "text-ink-muted",
                  )}
                />
              </button>
            </div>
          )}
        </div>

        <div className="mt-5 flex items-end gap-5">
          {/* 썸네일 */}
          <div className="size-24 shrink-0 overflow-hidden rounded-[24px] bg-tint-green shadow-[0px_4px_16px_rgba(30,60,35,0.1)]">
            {tea.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tea.image_url}
                alt={tea.tea_name ?? "차"}
                className="size-full object-cover"
              />
            ) : (
              <div className="grid size-full place-items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/decor/teacup.svg" alt="" className="size-12" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 pb-1">
            <div className="flex flex-wrap gap-1.5">
              {tea.tea_category && (
                <span className="rounded-full bg-brand px-2.5 py-0.5 text-[12px] font-bold text-white">
                  {tea.tea_category}
                </span>
              )}
              {tea.is_compressed && (
                <span className="rounded-full bg-[#e8b84b] px-2.5 py-0.5 text-[12px] font-bold text-brand-ink">
                  압축차
                </span>
              )}
            </div>
            <h1 className="mt-2 truncate text-[24px] font-black text-brand-ink">
              {tea.tea_name || "이름 미정"}
            </h1>
            {subtitle && (
              <p className="mt-0.5 text-[12px] text-ink-muted">{subtitle}</p>
            )}
            {avg > 0 && <div className="mt-2">{<LeafRating value={avg} />}</div>}
          </div>
        </div>
      </div>

      <main className="flex flex-1 flex-col px-6 pt-5 pb-10">
        {/* 스탯 카드 */}
        <div className="flex gap-2.5">
          <StatCard
            icon={<Thermometer className="size-4" />}
            value={guide?.water_temperature ?? "—"}
            label="권장 온도"
          />
          <StatCard
            icon={<Timer className="size-4" />}
            value={guide?.steeping_time ?? "—"}
            label="권장 시간"
          />
          <StatCard
            icon={<ScrollText className="size-4" />}
            value={`${logs.length}회`}
            label="기록 횟수"
          />
        </div>

        {/* 탭 */}
        <div className="mt-5 flex gap-1 rounded-[16px] bg-track p-1">
          {(
            [
              ["guide", "🍵 브루잉 가이드"],
              ["logs", `📝 기록 (${logs.length})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                "flex-1 rounded-[24px] py-2.5 text-[14px] font-bold transition-colors",
                tab === key
                  ? "bg-field text-brand-ink shadow-[0px_2px_4px_rgba(0,0,0,0.06)]"
                  : "text-ink-muted",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 탭 내용 */}
        {tab === "guide" ? (
          guide ? (
            <div className="mt-4 flex flex-col gap-3">
              {/* 우림 타이머 — 다시 우려먹을 때 */}
              <div className="rounded-[20px] border border-hairline bg-field p-5 shadow-[0px_2px_6px_rgba(30,60,35,0.05)]">
                <p className="text-[14px] font-black text-brand-ink">우림 타이머</p>
                <p className="mt-1 text-[12px] text-ink-muted">
                  다시 우릴 때 포별 시간을 재보세요.
                </p>
                <div className="mt-4">
                  <BrewTimer pours={derivePours(guide.steeping_time)} />
                </div>
              </div>

              <div className="rounded-[20px] border border-hairline bg-field p-[17px] shadow-[0px_2px_6px_rgba(30,60,35,0.05)]">
                <GuideRow label="물 온도" value={guide.water_temperature} />
                <GuideRow label="차 양" value={guide.tea_amount} />
                <GuideRow label="우리는 시간" value={guide.steeping_time} />
                <GuideRow label="추천 도구" value={guide.recommended_tool} />
                <GuideRow label="세차" value={guide.rinse_method} />
                {guide.guide_text && (
                  <p className="whitespace-pre-line pt-3 text-[12px] leading-[1.7] text-ink-muted">
                    💡 {guide.guide_text}
                  </p>
                )}
              </div>
              {guide.adjustment_tips && (
                <div className="rounded-[20px] border border-hairline bg-field p-[17px] shadow-[0px_2px_6px_rgba(30,60,35,0.05)]">
                  <p className="text-[14px] font-black text-brand-ink">
                    맛 조정 팁
                  </p>
                  <p className="mt-2 whitespace-pre-line rounded-[16px] bg-tint-cream/70 px-3 py-2.5 text-[12px] leading-[1.7] text-[#8b6e52]">
                    {guide.adjustment_tips}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="mt-8 text-center text-[14px] text-ink-muted">
              저장된 가이드가 없어요.
            </p>
          )
        ) : (
          <div className="mt-4">
            {logs.length === 0 ? (
              <div className="rounded-[20px] border border-hairline bg-field p-6 text-center">
                <p className="text-[13px] text-ink-muted">
                  아직 기록이 없어요. 차를 마신 뒤 남겨보세요.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {logs.map((log) => (
                  <li
                    key={log.id}
                    className="rounded-[20px] border border-hairline bg-field p-4 shadow-[0px_2px_6px_rgba(30,60,35,0.05)]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-bold text-brand-ink">
                        {log.brewed_at}
                      </span>
                      {log.rating != null && <LeafRating value={log.rating} />}
                    </div>
                    {log.next_adjustment && (
                      <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-brand-ink">
                        {log.next_adjustment}
                      </p>
                    )}
                    {log.photo_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={log.photo_url}
                        alt="찻자리 사진"
                        className="mt-2.5 aspect-video w-full rounded-[14px] object-cover"
                      />
                    )}
                    {log.taste_memo && (
                      <p className="mt-1.5 text-[13px] text-ink-muted">
                        맛 · {log.taste_memo}
                      </p>
                    )}
                    {log.aroma_memo && (
                      <p className="text-[13px] text-ink-muted">
                        향 · {log.aroma_memo}
                      </p>
                    )}

                    {/* 공개 토글 + 반응 (소유자) */}
                    {is_owner && (
                      <div className="mt-3 flex items-center justify-between border-t border-hairline pt-3">
                        <button
                          type="button"
                          onClick={() =>
                            togglePublic.mutate({
                              logId: log.id,
                              isPublic: !log.is_public,
                            })
                          }
                          disabled={togglePublic.isPending}
                          className={cn(
                            "flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold transition-colors disabled:opacity-60",
                            log.is_public
                              ? "bg-tint-green text-mark"
                              : "bg-track text-ink-muted",
                          )}
                        >
                          {log.is_public ? (
                            <Globe className="size-3.5" />
                          ) : (
                            <Lock className="size-3.5" />
                          )}
                          {log.is_public ? "피드 공개 중" : "비공개"}
                        </button>
                        <div className="flex items-center gap-1">
                          {log.is_public && (
                            <Link
                              href={`/p/${log.id}`}
                              className="mr-2 flex items-center gap-3 text-[12px] font-semibold text-ink-muted"
                            >
                              <span className="flex items-center gap-1">
                                <Heart className="size-3.5" />
                                {log.like_count}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="size-3.5" />
                                {log.comment_count}
                              </span>
                            </Link>
                          )}
                          <Link
                            href={`/tea/${id}/log?edit=${log.id}`}
                            aria-label="기록 수정"
                            className="grid size-8 place-items-center rounded-full text-ink-muted transition-colors hover:bg-track hover:text-brand-ink"
                          >
                            <Pencil className="size-4" />
                          </Link>
                          <button
                            type="button"
                            aria-label="기록 삭제"
                            onClick={() => setDeletingLog(log.id)}
                            className="grid size-8 place-items-center rounded-full text-ink-muted transition-colors hover:bg-track hover:text-red-500"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {deletingLog === log.id && (
                      <div className="mt-3 rounded-[14px] border border-red-200 bg-red-50/60 p-3">
                        <p className="text-[13px] font-bold text-red-600">
                          이 기록을 삭제할까요?
                        </p>
                        <p className="mt-1 text-[12px] text-red-500/90">
                          사진·좋아요·댓글이 함께 삭제되며 되돌릴 수 없어요.
                        </p>
                        <div className="mt-2.5 flex gap-2">
                          <button
                            type="button"
                            onClick={() => setDeletingLog(null)}
                            className="flex-1 rounded-pill border border-hairline bg-field py-2 text-[13px] font-bold text-brand-ink"
                          >
                            취소
                          </button>
                          <button
                            type="button"
                            disabled={delLog.isPending}
                            onClick={() =>
                              delLog.mutate(log.id, {
                                onSuccess: () => setDeletingLog(null),
                              })
                            }
                            className="flex-1 rounded-pill bg-red-500 py-2 text-[13px] font-bold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
                          >
                            {delLog.isPending ? "삭제 중…" : "삭제"}
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* 기록 추가 CTA (소유자) */}
        {is_owner && (
          <>
            <Link
              href={`/tea/${id}/log`}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-pill bg-brand px-6 py-4 text-[16px] font-bold text-white shadow-brand transition-colors hover:bg-brand-dark"
            >
              기록 추가하기
              <Plus className="size-[18px]" />
            </Link>

            <button
              type="button"
              onClick={onDelete}
              disabled={del.isPending}
              className="mx-auto mt-5 flex items-center justify-center gap-1.5 text-[13px] text-ink-muted transition-colors hover:text-red-500"
            >
              <Trash2 className="size-3.5" /> 차 삭제하기
            </button>
          </>
        )}
      </main>
    </PhoneFrame>
  );
}
