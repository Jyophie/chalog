"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Thermometer, Timer, Leaf, Droplets } from "lucide-react";
import { useScanFlow } from "@/store/scan-flow";
import { useSaveTea } from "@/hooks/use-teas";
import { brewingGuideSchema } from "@/lib/schemas/tea";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";

function GuideStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-card bg-tint-green/50 px-2 py-3 text-center">
      <span className="text-brand">{icon}</span>
      <span className="text-[11px] text-ink-muted">{label}</span>
      <span className="text-xs font-bold text-brand-ink">{value}</span>
    </div>
  );
}

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
      <div className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col">
        <TopBar title="우리는 가이드" />
        <main className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
          {error ? (
            <>
              <p className="text-sm text-red-500">{error}</p>
              <Button size="md" onClick={generate}>
                다시 시도
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="size-3 animate-bounce rounded-full bg-brand [animation-delay:-0.3s]" />
                <span className="size-3 animate-bounce rounded-full bg-brand [animation-delay:-0.15s]" />
                <span className="size-3 animate-bounce rounded-full bg-brand" />
              </div>
              <p className="font-display text-lg font-black text-brand-ink">
                가이드를 만드는 중이에요
              </p>
            </>
          )}
        </main>
      </div>
    );
  }

  const g = brewingGuide;
  const teaName = correctionForm.tea_name ?? analysisResult?.tea_name ?? "이 차";

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col">
      <TopBar title="우리는 가이드" />
      <main className="flex flex-1 flex-col px-6 pb-8">
        <h2 className="mt-1 font-display text-xl font-black text-brand-ink">
          {teaName} 우리는 법
        </h2>

        <div className="mt-4 grid grid-cols-4 gap-2">
          <GuideStat icon={<Thermometer className="size-5" />} label="물 온도" value={g.water_temperature} />
          <GuideStat icon={<Leaf className="size-5" />} label="차 양" value={g.tea_amount} />
          <GuideStat icon={<Timer className="size-5" />} label="우림 시간" value={g.steeping_time} />
          <GuideStat icon={<Droplets className="size-5" />} label="도구" value={g.recommended_tool} />
        </div>

        <section className="mt-5 space-y-4">
          <div className="rounded-card border border-border bg-surface p-4">
            <p className="mb-1 text-xs font-bold text-brand">세차</p>
            <p className="text-sm leading-relaxed text-brand-ink">{g.rinse_method}</p>
          </div>
          <div className="rounded-card border border-border bg-surface p-4">
            <p className="mb-1 text-xs font-bold text-brand">우리는 법</p>
            <p className="whitespace-pre-line text-sm leading-relaxed text-brand-ink">
              {g.guide_text}
            </p>
          </div>
          <div className="rounded-card bg-tint-cream/60 p-4">
            <p className="mb-1 text-xs font-bold text-[#9a7b1e]">맛 조정 팁</p>
            <p className="whitespace-pre-line text-sm leading-relaxed text-brand-ink">
              {g.adjustment_tips}
            </p>
          </div>
        </section>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        <div className="flex-1" />
        <Button
          size="lg"
          block
          className="mt-6"
          disabled={save.isPending}
          onClick={onSave}
        >
          {save.isPending ? "저장 중…" : "내 차 아카이브에 저장"}
        </Button>
      </main>
    </div>
  );
}
