"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAddLog } from "@/hooks/use-teas";
import { teaLogSchema, BREWING_TOOLS } from "@/lib/schemas/tea";
import type { BrewingToolEnum } from "@/lib/types/database";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/utils";

function Scale({
  value,
  onChange,
}: {
  value?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={cn(
            "h-9 flex-1 rounded-[10px] border text-sm font-bold transition-colors",
            value === n
              ? "border-brand bg-brand text-white"
              : "border-border bg-surface text-ink-muted hover:bg-tint-green",
          )}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** ⑩ 마신 기록 작성 */
export default function LogPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const addLog = useAddLog(id);

  const [brewedAt, setBrewedAt] = useState(todayISO());
  const [waterTemp, setWaterTemp] = useState("");
  const [steepTime, setSteepTime] = useState("");
  const [amount, setAmount] = useState("");
  const [tool, setTool] = useState<BrewingToolEnum>();
  const [taste, setTaste] = useState("");
  const [aroma, setAroma] = useState("");
  const [bitter, setBitter] = useState<number>();
  const [astringe, setAstringe] = useState<number>();
  const [rating, setRating] = useState<number>();
  const [adjust, setAdjust] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    const payload = teaLogSchema.safeParse({
      brewed_at: brewedAt,
      water_temperature: waterTemp || undefined,
      steeping_time: steepTime || undefined,
      tea_amount: amount || undefined,
      tool,
      taste_memo: taste || undefined,
      aroma_memo: aroma || undefined,
      bitterness_level: bitter,
      astringency_level: astringe,
      rating,
      next_adjustment: adjust || undefined,
    });
    if (!payload.success) {
      setError("입력값을 확인해주세요.");
      return;
    }
    try {
      await addLog.mutateAsync(payload.data);
      router.replace(`/tea/${id}`);
    } catch {
      setError("저장에 실패했어요. 다시 시도해주세요.");
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col">
      <TopBar title="기록 추가" />
      <main className="flex flex-1 flex-col gap-5 px-6 pb-8">
        <div>
          <Label htmlFor="d">마신 날짜</Label>
          <Input
            id="d"
            type="date"
            value={brewedAt}
            onChange={(e) => setBrewedAt(e.target.value)}
          />
        </div>

        <div>
          <Label>브루잉 조건</Label>
          <div className="grid grid-cols-3 gap-2">
            <Input placeholder="온도" value={waterTemp} onChange={(e) => setWaterTemp(e.target.value)} />
            <Input placeholder="시간" value={steepTime} onChange={(e) => setSteepTime(e.target.value)} />
            <Input placeholder="차 양" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
        </div>

        <div>
          <Label>사용 도구</Label>
          <div className="flex flex-wrap gap-2">
            {BREWING_TOOLS.map((t) => (
              <Chip key={t} selected={tool === t} onClick={() => setTool(t)}>
                {t}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="t">맛 메모</Label>
          <textarea
            id="t"
            rows={2}
            value={taste}
            onChange={(e) => setTaste(e.target.value)}
            placeholder="어떤 맛이었나요? 예: 꽃향, 달콤함, 약간 떫음…"
            className="w-full rounded-[14px] border border-border bg-surface px-4 py-3 text-sm text-brand-ink outline-none placeholder:text-ink-muted/60 focus:border-brand"
          />
        </div>

        <div>
          <Label htmlFor="a">향 메모</Label>
          <textarea
            id="a"
            rows={2}
            value={aroma}
            onChange={(e) => setAroma(e.target.value)}
            placeholder="어떤 향이었나요?"
            className="w-full rounded-[14px] border border-border bg-surface px-4 py-3 text-sm text-brand-ink outline-none placeholder:text-ink-muted/60 focus:border-brand"
          />
        </div>

        <div>
          <Label>쓴맛 정도</Label>
          <Scale value={bitter} onChange={setBitter} />
        </div>
        <div>
          <Label>떫은맛 정도</Label>
          <Scale value={astringe} onChange={setAstringe} />
        </div>
        <div>
          <Label>만족도</Label>
          <Scale value={rating} onChange={setRating} />
        </div>

        <div>
          <Label htmlFor="nx">다음에 조정할 점 (선택)</Label>
          <Input
            id="nx"
            value={adjust}
            onChange={(e) => setAdjust(e.target.value)}
            placeholder="예: 온도 낮추기, 시간 10초 줄이기"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button size="lg" block disabled={addLog.isPending} onClick={onSubmit}>
          {addLog.isPending ? "저장 중…" : "기록 저장하기"}
        </Button>
      </main>
    </div>
  );
}
