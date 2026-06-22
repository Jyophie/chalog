"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { useScanFlow } from "@/store/scan-flow";
import { analysisResultSchema } from "@/lib/schemas/tea";
import { PhoneFrame } from "@/components/layout/phone-frame";
import { cn } from "@/lib/utils";

const STEPS = [
  "이미지 로딩",
  "텍스트 추출 중",
  "차 종류 파악 중",
  "브루잉 정보 수집 중",
] as const;

/** 중앙 애니메이션 엠블럼 — 호흡하는 원 위로 둥둥 떠오르는 다호 */
function AnalyzingEmblem() {
  return (
    <div className="relative grid size-[200px] place-items-center">
      {/* 하나의 원형 배경 — 커졌다 줄어들기 반복 */}
      <div className="absolute size-[150px] animate-[breathe_3s_ease-in-out_infinite] rounded-full bg-[#cfe6d5]" />
      {/* 중앙 다호 — 둥둥 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/decor/daho.svg"
        alt=""
        aria-hidden
        className="relative size-[68px] animate-[bob_1.8s_ease-in-out_infinite]"
      />
    </div>
  );
}

/** ④ AI 분석 (로딩) */
export default function AnalyzePage() {
  const router = useRouter();
  const { imagePath, setAnalysisResult } = useScanFlow();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const started = useRef(false);

  async function run() {
    setError(null);
    setStep(0);
    try {
      const res = await fetch("/api/analyze-tea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagePath }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAnalysisResult(analysisResultSchema.parse(data));
      router.replace("/result");
    } catch {
      setError("분석에 실패했어요. 다시 시도해주세요.");
    }
  }

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (!imagePath) {
      router.replace("/upload");
      return;
    }
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 단계 표시를 순차적으로 진행시켜 진행감을 준다 (실제 분석은 단일 호출)
  useEffect(() => {
    if (error) return;
    const id = setInterval(
      () => setStep((s) => Math.min(s + 1, STEPS.length - 1)),
      1300,
    );
    return () => clearInterval(id);
  }, [error]);

  const progress = Math.min(95, ((step + 1) / STEPS.length) * 100);

  if (error) {
    return (
      <PhoneFrame>
        <main className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
          <span className="text-5xl">🫖</span>
          <p className="text-[15px] font-semibold text-brand-ink">{error}</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.replace("/upload")}
              className="rounded-pill border border-hairline bg-field px-5 py-3 text-[14px] font-bold text-brand-ink"
            >
              다시 올리기
            </button>
            <button
              type="button"
              onClick={run}
              className="rounded-pill bg-brand px-5 py-3 text-[14px] font-bold text-white shadow-brand"
            >
              다시 시도
            </button>
          </div>
        </main>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-10">
        <AnalyzingEmblem />

        <h2 className="mt-10 text-center text-[24px] font-black text-brand-ink">
          분석하고 있어요
        </h2>
        <p className="mt-2 text-center text-[14px] text-ink-muted">
          사진 속 텍스트와 단서를 읽고 있어요 🍃
        </p>

        {/* 단계 목록 */}
        <div className="mt-8 flex w-full max-w-[342px] flex-col gap-2.5">
          {STEPS.map((label, i) => {
            const state =
              i < step ? "done" : i === step ? "active" : "pending";
            return (
              <div
                key={label}
                className={cn(
                  "flex items-center gap-3 rounded-[16px] px-4 py-3 transition-colors",
                  state === "done" && "border border-hairline bg-tint-green",
                  state === "active" &&
                    "border-[1.5px] border-brand bg-field",
                  state === "pending" && "border border-hairline bg-field",
                )}
              >
                {/* 상태 인디케이터 */}
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full",
                    state === "done" ? "bg-brand" : "bg-track",
                  )}
                >
                  {state === "done" ? (
                    <Check className="size-3 text-white" strokeWidth={3} />
                  ) : (
                    <span
                      className={cn(
                        "rounded-full",
                        state === "active"
                          ? "size-2.5 animate-pulse bg-brand"
                          : "size-2.5 bg-ink-muted/35",
                      )}
                    />
                  )}
                </span>

                <span
                  className={cn(
                    "flex-1 text-[14px] font-semibold",
                    state === "pending" ? "text-ink-muted" : "text-brand-ink",
                  )}
                >
                  {label}
                </span>

                {state === "done" && (
                  <Check className="size-3.5 text-brand" strokeWidth={2.5} />
                )}
                {state === "active" && (
                  <span className="text-[12px] text-brand">진행 중</span>
                )}
              </div>
            );
          })}
        </div>

        {/* 진행 바 */}
        <div className="mt-8 h-2 w-full max-w-[342px] overflow-hidden rounded-full bg-track">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand to-[#a8c9b0] transition-[width] duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </main>
    </PhoneFrame>
  );
}
