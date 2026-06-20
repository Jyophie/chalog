"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useScanFlow } from "@/store/scan-flow";
import { TEA_CATEGORIES, LEAF_SHAPES, BREWING_TOOLS } from "@/lib/schemas/tea";
import type {
  TeaCategory,
  LeafShape,
  BrewingToolEnum,
} from "@/lib/types/database";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Chip } from "@/components/ui/chip";

function ChipGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value?: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Chip key={o} selected={value === o} onClick={() => onChange(o)}>
          {o}
        </Chip>
      ))}
    </div>
  );
}

/** ⑥ 추가 정보 입력 / 보정 */
export default function CorrectionPage() {
  const router = useRouter();
  const { analysisResult, setCorrectionForm } = useScanFlow();

  const [teaName, setTeaName] = useState("");
  const [brand, setBrand] = useState("");
  const [origin, setOrigin] = useState("");
  const [year, setYear] = useState("");
  const [category, setCategory] = useState<TeaCategory>();
  const [leaf, setLeaf] = useState<LeafShape>();
  const [tool, setTool] = useState<BrewingToolEnum>();
  const [compressed, setCompressed] = useState(false);
  const [style, setStyle] = useState("");
  const [memo, setMemo] = useState("");

  // 분석 결과로 프리필
  useEffect(() => {
    if (!analysisResult) {
      router.replace("/upload");
      return;
    }
    setTeaName(analysisResult.tea_name ?? "");
    setBrand(analysisResult.brand ?? "");
    setOrigin(analysisResult.origin ?? "");
    setYear(analysisResult.production_year ?? "");
    if (analysisResult.tea_category) setCategory(analysisResult.tea_category);
  }, [analysisResult, router]);

  const canSubmit = category && leaf && tool;

  function onSubmit() {
    if (!canSubmit) return;
    setCorrectionForm({
      tea_name: teaName || undefined,
      brand: brand || undefined,
      origin: origin || undefined,
      production_year: year || undefined,
      tea_category: category,
      leaf_shape: leaf,
      brewing_tool: tool,
      is_compressed: compressed,
      drinking_style: style || undefined,
      user_memo: memo || undefined,
    });
    router.push("/guide");
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col">
      <TopBar title="정보 보정" />
      <main className="flex flex-1 flex-col gap-6 px-6 pb-8">
        <p className="text-sm text-ink-muted">
          AI가 추정한 정보를 확인하고, 아는 만큼만 채워주세요. 모르면 “잘 모르겠음”도 괜찮아요.
        </p>

        {/* 기본 정보 */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="tn">차 이름</Label>
            <Input id="tn" value={teaName} onChange={(e) => setTeaName(e.target.value)} placeholder="예: 동방미인" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="br">브랜드</Label>
              <Input id="br" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="선택" />
            </div>
            <div>
              <Label htmlFor="yr">생산연도</Label>
              <Input id="yr" value={year} onChange={(e) => setYear(e.target.value)} placeholder="선택" />
            </div>
          </div>
          <div>
            <Label htmlFor="or">산지</Label>
            <Input id="or" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="선택" />
          </div>
        </div>

        <div>
          <Label>차 종류 *</Label>
          <ChipGroup options={TEA_CATEGORIES} value={category} onChange={setCategory} />
        </div>

        <div>
          <Label>찻잎 형태 *</Label>
          <ChipGroup options={LEAF_SHAPES} value={leaf} onChange={setLeaf} />
        </div>

        <label className="flex items-center justify-between rounded-card border border-border bg-surface px-4 py-3">
          <span className="text-sm font-semibold text-brand-ink">압축차예요</span>
          <input
            type="checkbox"
            checked={compressed}
            onChange={(e) => setCompressed(e.target.checked)}
            className="size-5 accent-[var(--color-brand)]"
          />
        </label>

        <div>
          <Label>사용 도구 *</Label>
          <ChipGroup options={BREWING_TOOLS} value={tool} onChange={setTool} />
        </div>

        <div>
          <Label htmlFor="st">원하는 음용 방식 (선택)</Label>
          <Input id="st" value={style} onChange={(e) => setStyle(e.target.value)} placeholder="예: 진하게 / 연하게" />
        </div>

        <div>
          <Label htmlFor="mm">메모 (선택)</Label>
          <textarea
            id="mm"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
            placeholder="추가로 알려주고 싶은 정보가 있나요?"
            className="w-full rounded-[14px] border border-border bg-surface px-4 py-3 text-sm text-brand-ink outline-none placeholder:text-ink-muted/60 focus:border-brand"
          />
        </div>

        <Button size="lg" block disabled={!canSubmit} onClick={onSubmit}>
          가이드 생성하기
        </Button>
      </main>
    </div>
  );
}
