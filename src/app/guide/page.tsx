"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bookmark, Coffee, Leaf, Scale, Thermometer, Timer } from "lucide-react";
import { useScanFlow } from "@/store/scan-flow";
import { useSaveTea } from "@/hooks/use-teas";
import { brewingGuideSchema } from "@/lib/schemas/tea";
import { PhoneFrame } from "@/components/layout/phone-frame";
import { BrewTimer, derivePours } from "@/components/brew-timer";

/** ⑦ 우리는 가이드 생성 + 저장 */
export default function GuidePage() {
  const router = useRouter();
  const {
    analysisResult,
    correctionForm,
    brewingGuide,
    imagePath,
    setBrewingGuide,
    resetScanFlow,
  } = useScanFlow();
  const save = useSaveTea();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  async function generate() {
    setError(null);
    const r = analysisResult!;
    const cf = correctionForm;
    const input = {
      tea_name: cf.tea_name ?? r.tea_name,
      tea_category: cf.tea_category ?? r.tea_category,
      brand: cf.brand ?? r.brand,
      origin: cf.origin ?? r.origin,
      production_year: cf.production_year ?? r.production_year,
      leaf_shape: cf.leaf_shape,
      is_compressed: cf.is_compressed,
      brewing_tool: cf.brewing_tool,
      drinking_style: cf.drinking_style,
      user_memo: cf.user_memo,
    };
    try {
      const res = await fetch("/api/generate-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error();
      setBrewingGuide(brewingGuideSchema.parse(await res.json()));
    } catch {
      setError("가이드 생성에 실패했어요. 다시 시도해주세요.");
    }
  }

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (!analysisResult || !correctionForm.tea_category) {
      router.replace("/upload");
      return;
    }
    if (!brewingGuide) generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSave() {
    if (!brewingGuide || !analysisResult) return;
    const r = analysisResult;
    const cf = correctionForm;
    try {
      const { id } = await save.mutateAsync({
        imagePath,
        guide: brewingGuide,
        tea: {
          tea_name: cf.tea_name ?? r.tea_name,
          tea_category: cf.tea_category ?? r.tea_category,
          brand: cf.brand ?? r.brand,
          origin: cf.origin ?? r.origin,
          production_year: cf.production_year ?? r.production_year,
          leaf_shape: cf.leaf_shape,
          is_compressed: cf.is_compressed,
          brewing_tool: cf.brewing_tool,
          drinking_style: cf.drinking_style,
          user_memo: cf.user_memo,
          ai_summary: r.analysis_summary,
          confidence_level: r.confidence_level,
          extracted_text: r.extracted_text,
        },
      });
      resetScanFlow();
      router.replace(`/tea/${id}`);
    } catch {
      setError("저장에 실패했어요. 다시 시도해주세요.");
    }
  }

  // 로딩 / 에러
  if (!brewingGuide) {
    return (
      <PhoneFrame>
        <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
          {error ? (
            <>
              <span className="text-5xl">🫖</span>
              <p className="text-[15px] font-semibold text-brand-ink">{error}</p>
              <button
                type="button"
                onClick={generate}
                className="rounded-pill bg-brand px-6 py-3 text-[14px] font-bold text-white shadow-brand"
              >
                다시 시도
              </button>
            </>
          ) : (
            <>
              <div className="relative grid size-[160px] place-items-center">
                <div className="absolute size-[120px] animate-[breathe_3s_ease-in-out_infinite] rounded-full bg-[#cfe6d5]" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/decor/daho.svg"
                  alt=""
                  className="relative size-[56px] animate-[bob_1.8s_ease-in-out_infinite]"
                />
              </div>
              <p className="text-[18px] font-black text-brand-ink">
                우리는 가이드를 만들고 있어요
              </p>
            </>
          )}
        </main>
      </PhoneFrame>
    );
  }

  const g = brewingGuide;
  const teaName =
    correctionForm.tea_name ?? analysisResult?.tea_name ?? "이 차";

  const pills = [
    { icon: Thermometer, value: g.water_temperature },
    { icon: Timer, value: g.steeping_time },
    { icon: Scale, value: g.tea_amount },
    { icon: Coffee, value: g.recommended_tool },
  ].filter((p) => p.value);

  const steps = g.guide_text
    .split(/\n+/)
    .map((s) => s.trim().replace(/^\s*\d+[.)]\s*/, "").replace(/^[-·]\s*/, ""))
    .filter(Boolean);

  return (
    <PhoneFrame>
      {/* 헤더 */}
      <div className="relative border-b border-hairline px-6 pt-14 pb-6">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로"
          className="absolute left-6 top-14 grid size-10 place-items-center rounded-full bg-track text-brand-ink transition-colors hover:bg-[#e3ddd0]"
        >
          <ArrowLeft className="size-[18px]" />
        </button>

        <div className="flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/decor/daho.svg" alt="" className="size-[72px]" />
          <h1 className="mt-2 text-center text-[20px] font-black text-brand-ink">
            {teaName} · 우리는 가이드
          </h1>
          <p className="mt-1 text-[12px] text-ink-muted">
            먼저 아래 방식으로 우려보는 걸 추천해요 🌿
          </p>

          {/* 핵심 정보 pill */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {pills.map(({ icon: Icon, value }) => (
              <span
                key={value}
                className="flex items-center gap-1.5 rounded-full border border-hairline bg-field px-3 py-1.5 text-[12px] font-semibold text-brand-ink shadow-[0px_1px_2.5px_rgba(0,0,0,0.06)]"
              >
                <Icon className="size-3.5 text-brand" /> {value}
              </span>
            ))}
          </div>
        </div>
      </div>

      <main className="flex flex-1 flex-col px-6 pt-5 pb-10">
        {/* 세차 권장 배너 */}
        {g.rinse_method && (
          <div className="flex gap-2.5 rounded-[16px] bg-tint-green px-4 py-3">
            <Leaf className="mt-0.5 size-3.5 shrink-0 text-mark" />
            <p className="text-[12px] leading-[1.6] text-[#2d5a3d]">
              <span className="font-bold">세차 · </span>
              {g.rinse_method}
            </p>
          </div>
        )}

        {/* 우림 타이머 */}
        <div className="mt-5 rounded-[20px] border border-hairline bg-field p-5 shadow-[0px_2px_6px_rgba(30,60,35,0.05)]">
          <p className="text-[14px] font-black text-brand-ink">우림 타이머</p>
          <p className="mt-1 text-[12px] text-ink-muted">
            권장 {g.steeping_time} 기준이에요. 입맛에 맞게 조절해 보세요.
          </p>
          <div className="mt-4">
            <BrewTimer pours={derivePours(g.steeping_time)} />
          </div>
        </div>

        {/* 브루잉 단계 */}
        {steps.length > 0 && (
          <>
            <h2 className="mt-6 text-[14px] font-black text-brand-ink">
              브루잉 단계
            </h2>
            <div className="mt-3 flex flex-col gap-2.5">
              {steps.map((text, i) => (
                <div
                  key={i}
                  className="flex gap-3 rounded-[20px] border border-hairline bg-field p-[15px] shadow-[0px_2px_6px_rgba(30,60,35,0.05)]"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-track text-[14px] font-black text-brand">
                    {i + 1}
                  </span>
                  <p className="flex-1 self-center text-[12px] leading-[1.6] text-brand-ink">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 맛 조정 팁 */}
        {g.adjustment_tips && (
          <div className="mt-6 rounded-[20px] border border-hairline bg-field p-[17px] shadow-[0px_2px_6px_rgba(30,60,35,0.05)]">
            <p className="text-[14px] font-black text-brand-ink">맛 조정 팁</p>
            <p className="mt-3 whitespace-pre-line rounded-[16px] bg-tint-cream/70 px-3 py-2.5 text-[12px] leading-[1.7] text-[#8b6e52]">
              {g.adjustment_tips}
            </p>
          </div>
        )}

        {error && <p className="mt-4 text-[13px] text-red-500">{error}</p>}

        {/* 저장 CTA */}
        <button
          type="button"
          onClick={onSave}
          disabled={save.isPending}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-pill bg-brand px-6 py-4 text-[16px] font-bold text-white shadow-brand transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {save.isPending ? "저장 중…" : "내 아카이브에 저장하기"}
          {!save.isPending && <Bookmark className="size-[18px]" />}
        </button>
      </main>
    </PhoneFrame>
  );
}
