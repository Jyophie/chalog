"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CircleAlert, Leaf, Pencil, Sparkles } from "lucide-react";
import { useScanFlow } from "@/store/scan-flow";
import { PhoneFrame } from "@/components/layout/phone-frame";
import { TopBar } from "@/components/layout/top-bar";
import { cn } from "@/lib/utils";

/** 확신도 뱃지 색 */
const CONF_STYLE: Record<string, string> = {
  높음: "bg-tint-green text-mark",
  중간: "bg-tint-cream text-[#8b6e52]",
  낮음: "bg-tint-beige text-ink-muted",
};

function Row({ label, value }: { label: string; value?: string | null }) {
  const missing = !value;
  return (
    <div className="flex items-center gap-3 border-t border-hairline py-3">
      <span className="w-16 shrink-0 text-[12px] font-bold text-ink-muted">
        {label}
      </span>
      <span
        className={cn(
          "flex-1 text-[14px] font-semibold",
          missing ? "italic text-ink-muted" : "text-brand-ink",
        )}
      >
        {value || "확인 필요"}
      </span>
      {missing && <CircleAlert className="size-3.5 shrink-0 text-ink-muted/70" />}
    </div>
  );
}

/** ⑤ AI 분석 결과 */
export default function ResultPage() {
  const router = useRouter();
  const { analysisResult, previewUrl, setCorrectionForm } = useScanFlow();

  useEffect(() => {
    if (!analysisResult) router.replace("/upload");
  }, [analysisResult, router]);

  if (!analysisResult) return null;
  const r = analysisResult;

  // 빠른 경로: AI 결과를 보정값에 채우고 바로 가이드로 (찻잎/도구는 사용자가 알 수 없을 수 있어 기본값)
  function onQuickGuide() {
    setCorrectionForm({
      tea_name: r.tea_name ?? undefined,
      brand: r.brand ?? undefined,
      origin: r.origin ?? undefined,
      production_year: r.production_year ?? undefined,
      tea_category: r.tea_category ?? "잘 모르겠음",
      leaf_shape: "잘 모르겠음",
      brewing_tool: "잘 모르겠음",
      is_compressed: false,
    });
    router.push("/guide");
  }

  return (
    <PhoneFrame>
      <TopBar title="AI 분석 결과" onBack={() => router.push("/upload")} />

      <main className="flex flex-1 flex-col px-6 pt-2 pb-10">
        {/* 요약 배너 */}
        <div className="flex gap-3 rounded-[16px] bg-tint-cream px-4 py-3.5">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-[#8b6e52]" />
          <div className="text-[12px] leading-[1.65] text-[#8b6e52]">
            <p className="font-bold">{r.analysis_summary}</p>
            <p>확인 후 틀린 부분은 수정해주세요.</p>
          </div>
        </div>

        {/* 확신도 + 차 종류 뱃지 */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-full px-3 py-1 text-[12px] font-bold",
              CONF_STYLE[r.confidence_level],
            )}
          >
            AI 확신도 · {r.confidence_level}
          </span>
          {r.tea_category && (
            <span className="flex items-center gap-1.5 rounded-full bg-tint-green px-3 py-1 text-[12px] font-bold text-mark">
              <Leaf className="size-2.5" /> {r.tea_category}
            </span>
          )}
        </div>

        {/* 메인 결과 카드 */}
        <div className="mt-4 rounded-[20px] border border-hairline bg-field p-[19px] shadow-[0px_2px_6px_rgba(30,60,35,0.05)]">
          <div className="flex gap-4">
            {/* 썸네일 */}
            <div className="size-16 shrink-0 overflow-hidden rounded-[16px] bg-tint-green">
              {previewUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="차 사진"
                  className="size-full object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-[18px] font-black text-brand-ink">
                {r.tea_name || "이름 미확인"}
              </h2>
              {r.origin && (
                <p className="mt-0.5 text-[12px] text-ink-muted">{r.origin}</p>
              )}
              {r.tea_category && (
                <span className="mt-2 inline-block rounded-full bg-tint-green px-2.5 py-1 text-[12px] font-semibold text-mark">
                  {r.tea_category}
                </span>
              )}
            </div>
          </div>

          {/* 상세 필드 */}
          <div className="mt-4">
            <Row label="브랜드" value={r.brand} />
            <Row label="산지" value={r.origin} />
            <Row label="생산연도" value={r.production_year} />
          </div>
        </div>

        {/* 추출된 텍스트 */}
        {r.extracted_text && (
          <div className="mt-4 rounded-[20px] border border-hairline bg-field p-[17px] shadow-[0px_2px_6px_rgba(30,60,35,0.05)]">
            <p className="text-[12px] font-bold text-ink-muted">
              📝 추출된 텍스트
            </p>
            <p className="mt-2 rounded-[16px] bg-track px-3 py-2 font-mono text-[12px] leading-[1.6] text-brand-ink">
              {r.extracted_text}
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={onQuickGuide}
            className="flex w-full items-center justify-center gap-2 rounded-pill bg-brand px-6 py-4 text-[16px] font-bold text-white shadow-brand transition-colors hover:bg-brand-dark"
          >
            이 정보로 가이드 생성하기
            <ArrowRight className="size-[18px]" />
          </button>
          <button
            type="button"
            onClick={() => router.push("/correction")}
            className="flex w-full items-center justify-center gap-2 rounded-pill border-2 border-brand px-6 py-[15px] text-[16px] font-bold text-brand transition-colors hover:bg-tint-green/40"
          >
            정보 수정하기
            <Pencil className="size-4" />
          </button>
        </div>
      </main>
    </PhoneFrame>
  );
}
