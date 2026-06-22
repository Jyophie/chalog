"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useScanFlow } from "@/store/scan-flow";
import { TEA_CATEGORIES, LEAF_SHAPES, BREWING_TOOLS } from "@/lib/schemas/tea";
import type {
  TeaCategory,
  LeafShape,
  BrewingToolEnum,
} from "@/lib/types/database";
import { PhoneFrame } from "@/components/layout/phone-frame";
import { TopBar } from "@/components/layout/top-bar";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/ui/chip";

const DRINKING_STYLES = ["따뜻하게", "아이스로", "진하게", "연하게", "라떼로"];
const COMPRESSED_OPTIONS = ["예", "아니오", "모르겠음"] as const;
type Compressed = (typeof COMPRESSED_OPTIONS)[number];

/** 그룹별 선택 색 */
const TONE = {
  brand: undefined, // 기본 브랜드 그린
  brown:
    "border-[#8b6e52] bg-[#8b6e52] text-white shadow-[0px_2px_5px_rgba(139,110,82,0.19)]",
  deep: "border-mark bg-mark text-white shadow-[0px_2px_5px_rgba(45,90,61,0.19)]",
  terracotta:
    "border-[#d4714a] bg-[#d4714a] text-white shadow-[0px_2px_5px_rgba(212,113,74,0.19)]",
} as const;

function FieldLabel({
  children,
  required,
  optional,
}: {
  children: React.ReactNode;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <p className="mb-2.5 text-[14px] font-bold text-brand-ink">
      {children}
      {required && <span className="ml-1 text-[11px] text-[#d4714a]">필수</span>}
      {optional && (
        <span className="ml-1 text-[14px] font-normal text-ink-muted">
          (선택)
        </span>
      )}
    </p>
  );
}

function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  activeClassName,
}: {
  options: readonly T[];
  value?: T;
  onChange: (v: T) => void;
  activeClassName?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Chip
          key={o}
          selected={value === o}
          activeClassName={activeClassName}
          onClick={() => onChange(o)}
        >
          {o}
        </Chip>
      ))}
    </div>
  );
}

/** ⑥ 정보 확인 · 수정 */
export default function CorrectionPage() {
  const router = useRouter();
  const { analysisResult, setCorrectionForm } = useScanFlow();

  const [teaName, setTeaName] = useState("");
  const [brand, setBrand] = useState("");
  const [origin, setOrigin] = useState("");
  const [year, setYear] = useState("");
  const [category, setCategory] = useState<TeaCategory>();
  const [leaf, setLeaf] = useState<LeafShape>();
  const [compressed, setCompressed] = useState<Compressed>();
  const [tool, setTool] = useState<BrewingToolEnum>();
  const [style, setStyle] = useState<string>();
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

  const canSubmit = category && tool;

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
      is_compressed: compressed === "예",
      drinking_style: style || undefined,
      user_memo: memo || undefined,
    });
    router.push("/guide");
  }

  return (
    <PhoneFrame>
      <TopBar title="정보 확인 · 수정" onBack={() => router.push("/result")} />

      <main className="flex flex-1 flex-col px-6 pt-2 pb-10">
        <p className="text-[14px] leading-[1.5] text-ink-muted">
          AI 분석 결과를 바탕으로 미리 채웠어요. 틀린 곳이 있으면 수정해주세요!
        </p>

        {/* 기본 정보 */}
        <div className="mt-5 flex flex-col gap-4">
          <div>
            <FieldLabel>차 이름</FieldLabel>
            <Input
              value={teaName}
              onChange={(e) => setTeaName(e.target.value)}
              placeholder="예: 동방미인"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>브랜드</FieldLabel>
              <Input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="선택"
              />
            </div>
            <div>
              <FieldLabel>생산연도</FieldLabel>
              <Input
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="예: 2024"
              />
            </div>
          </div>
          <div>
            <FieldLabel>산지</FieldLabel>
            <Input
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="선택"
            />
          </div>
        </div>

        {/* 차 종류 (필수) */}
        <div className="mt-6">
          <FieldLabel required>차 종류 </FieldLabel>
          <ChipGroup
            options={TEA_CATEGORIES}
            value={category}
            onChange={setCategory}
          />
        </div>

        {/* 찻잎 형태 */}
        <div className="mt-6">
          <FieldLabel>찻잎 형태</FieldLabel>
          <ChipGroup
            options={LEAF_SHAPES}
            value={leaf}
            onChange={setLeaf}
            activeClassName={TONE.brown}
          />
        </div>

        {/* 압축차 여부 */}
        <div className="mt-6">
          <FieldLabel>압축차 여부</FieldLabel>
          <ChipGroup
            options={COMPRESSED_OPTIONS}
            value={compressed}
            onChange={setCompressed}
          />
        </div>

        {/* 사용 도구 (필수) */}
        <div className="mt-6">
          <FieldLabel required>사용 도구 </FieldLabel>
          <ChipGroup
            options={BREWING_TOOLS}
            value={tool}
            onChange={setTool}
            activeClassName={TONE.deep}
          />
        </div>

        {/* 음용 방식 */}
        <div className="mt-6">
          <FieldLabel>음용 방식</FieldLabel>
          <ChipGroup
            options={DRINKING_STYLES}
            value={style}
            onChange={(v) => setStyle(style === v ? undefined : v)}
            activeClassName={TONE.terracotta}
          />
        </div>

        {/* 추가 메모 */}
        <div className="mt-6">
          <FieldLabel optional>추가 메모 </FieldLabel>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
            placeholder="AI에게 전달하고 싶은 내용이 있으면 적어주세요"
            className="w-full rounded-[16px] border border-hairline bg-field px-[17px] py-[13px] text-[14px] text-brand-ink outline-none transition-colors placeholder:text-[#1e2b2080] focus:border-brand"
          />
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-pill bg-brand px-6 py-4 text-[16px] font-bold text-white shadow-brand transition-colors hover:bg-brand-dark disabled:opacity-50"
        >
          우리는 가이드 생성하기
          <ArrowRight className="size-[18px]" />
        </button>
      </main>
    </PhoneFrame>
  );
}
