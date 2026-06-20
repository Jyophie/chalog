"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useScanFlow } from "@/store/scan-flow";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CONFIDENCE_STYLE: Record<string, string> = {
  높음: "bg-tint-green text-brand",
  중간: "bg-tint-cream text-[#9a7b1e]",
  낮음: "bg-tint-beige text-ink-muted",
};

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-3 last:border-0">
      <span className="text-sm text-ink-muted">{label}</span>
      <span className="text-sm font-semibold text-brand-ink">
        {value || <span className="text-ink-muted/70">확인 필요</span>}
      </span>
    </div>
  );
}

/** ⑤ AI 분석 결과 */
export default function ResultPage() {
  const router = useRouter();
  const { analysisResult, previewUrl } = useScanFlow();

  useEffect(() => {
    if (!analysisResult) router.replace("/upload");
  }, [analysisResult, router]);

  if (!analysisResult) return null;
  const r = analysisResult;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col">
      <TopBar title="분석 결과" />
      <main className="flex flex-1 flex-col px-6 pb-8">
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="차 사진"
            className="aspect-[4/3] w-full rounded-[20px] object-cover"
          />
        )}

        {/* 확신도 + 요약 */}
        <div className="mt-5 rounded-card bg-tint-green/50 p-4">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-bold",
                CONFIDENCE_STYLE[r.confidence_level],
              )}
            >
              확신도 {r.confidence_level}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-brand-ink">
            {r.analysis_summary}
          </p>
        </div>

        {/* 추정 정보 */}
        <div className="mt-5 rounded-card border border-border bg-surface px-4">
          <Field label="차 이름" value={r.tea_name} />
          <Field label="차 종류" value={r.tea_category} />
          <Field label="브랜드" value={r.brand} />
          <Field label="산지" value={r.origin} />
          <Field label="생산연도" value={r.production_year} />
        </div>

        {r.extracted_text && (
          <div className="mt-4">
            <p className="mb-1 text-xs font-semibold text-ink-muted">
              사진에서 읽은 텍스트
            </p>
            <p className="rounded-card bg-tint-beige/50 p-3 text-xs leading-relaxed text-ink-muted">
              {r.extracted_text}
            </p>
          </div>
        )}

        <div className="flex-1" />

        <p className="mt-6 text-center text-xs text-ink-muted">
          정보를 보완하면 더 잘 맞는 가이드를 만들어드려요.
        </p>
        <Button
          size="lg"
          block
          className="mt-3"
          onClick={() => router.push("/correction")}
        >
          정보 입력하고 가이드 만들기
        </Button>
      </main>
    </div>
  );
}
