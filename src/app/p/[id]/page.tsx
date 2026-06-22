"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  Leaf,
  MessageCircle,
  ScrollText,
  Thermometer,
  Timer,
} from "lucide-react";
import { usePublicTea } from "@/hooks/use-teas";
import { PhoneFrame } from "@/components/layout/phone-frame";
import { BrewTimer, derivePours } from "@/components/brew-timer";
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

/** 공개 차 상세 (읽기 전용, 비로그인 포함) */
export default function PublicTeaPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = usePublicTea(id);

  if (isLoading) {
    return (
      <PhoneFrame>
        <div className="px-6 pt-14">
          <div className="h-40 w-full animate-pulse rounded-[24px] bg-tint-green/50" />
        </div>
      </PhoneFrame>
    );
  }
  if (isError || !data) {
    return (
      <PhoneFrame>
        <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <span className="text-5xl">🫖</span>
          <p className="text-[14px] text-ink-muted">
            공개되지 않았거나 삭제된 기록이에요.
          </p>
          <button
            type="button"
            onClick={() => router.push("/explore")}
            className="rounded-pill border border-hairline bg-field px-5 py-2.5 text-[14px] font-bold text-brand-ink"
          >
            탐색으로
          </button>
        </main>
      </PhoneFrame>
    );
  }

  const { tea, guide, logs, author } = data;
  const rated = logs.filter((l) => l.rating != null);
  const avg = rated.length
    ? Math.round(rated.reduce((s, l) => s + (l.rating ?? 0), 0) / rated.length)
    : 0;
  const subtitle = [tea.origin, tea.production_year].filter(Boolean).join(" · ");

  return (
    <PhoneFrame>
      {/* 헤더 */}
      <div className="border-b border-hairline px-6 pt-14 pb-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="뒤로"
            className="grid size-10 place-items-center rounded-full bg-track text-brand-ink transition-colors hover:bg-[#e3ddd0]"
          >
            <ArrowLeft className="size-[18px]" />
          </button>
          <div className="flex items-center gap-3 text-[13px] text-ink-muted">
            <span className="flex items-center gap-1">
              <Heart
                className={cn(
                  "size-4",
                  data.liked_by_me && "fill-[#d4714a] text-[#d4714a]",
                )}
              />
              {tea.like_count}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="size-4" />
              {tea.comment_count}
            </span>
          </div>
        </div>

        <div className="mt-5 flex items-end gap-5">
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
            </div>
            <h1 className="mt-2 truncate text-[24px] font-black text-brand-ink">
              {tea.tea_name || "이름 미정"}
            </h1>
            {subtitle && (
              <p className="mt-0.5 text-[12px] text-ink-muted">{subtitle}</p>
            )}
            <p className="mt-1 text-[12px] font-semibold text-brand">
              by {author ?? "차 애호가"}
            </p>
          </div>
        </div>
      </div>

      <main className="flex flex-1 flex-col px-6 pt-5 pb-10">
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
            label="공개 기록"
          />
        </div>

        {guide && (
          <div className="mt-5 flex flex-col gap-3">
            <div className="rounded-[20px] border border-hairline bg-field p-5 shadow-[0px_2px_6px_rgba(30,60,35,0.05)]">
              <p className="text-[14px] font-black text-brand-ink">우림 타이머</p>
              <p className="mt-1 text-[12px] text-ink-muted">
                이 레시피로 우려볼까요?
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
          </div>
        )}

        {logs.length > 0 && (
          <>
            <h2 className="mt-6 text-[14px] font-black text-brand-ink">
              시음 기록
            </h2>
            <ul className="mt-3 flex flex-col gap-2.5">
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
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </PhoneFrame>
  );
}
