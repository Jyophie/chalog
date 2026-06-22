"use client";

import { useState } from "react";
import { TEA_CATEGORIES, LEAF_SHAPES, BREWING_TOOLS } from "@/lib/schemas/tea";
import type {
  TeaCategory,
  LeafShape,
  BrewingToolEnum,
} from "@/lib/types/database";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/utils";

export interface TeaInfoValues {
  tea_name?: string;
  brand?: string;
  origin?: string;
  production_year?: string;
  tea_category?: TeaCategory;
  leaf_shape?: LeafShape;
  brewing_tool?: BrewingToolEnum;
  is_compressed: boolean;
  drinking_style?: string;
  user_memo?: string;
}

const DRINKING_STYLES = ["따뜻하게", "아이스로", "진하게", "연하게", "라떼로"];
const COMPRESSED_OPTIONS = ["예", "아니오", "모르겠음"] as const;
type Compressed = (typeof COMPRESSED_OPTIONS)[number];

/** 그룹별 선택 색 */
const TONE = {
  brand: undefined,
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

/**
 * 차 정보 입력/수정 폼 (보정⑥ + 차 정보 수정 화면 공유).
 * 내부 상태를 initial로 시드하고, 버튼을 누르면 조립한 값을 콜백으로 전달한다.
 */
export function TeaInfoForm({
  initial,
  submitLabel,
  onSubmit,
  secondaryLabel,
  onSecondary,
  pending = false,
  className,
}: {
  initial?: Partial<TeaInfoValues>;
  submitLabel: string;
  onSubmit: (values: TeaInfoValues) => void;
  secondaryLabel?: string;
  onSecondary?: (values: TeaInfoValues) => void;
  pending?: boolean;
  className?: string;
}) {
  const [teaName, setTeaName] = useState(initial?.tea_name ?? "");
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [origin, setOrigin] = useState(initial?.origin ?? "");
  const [year, setYear] = useState(initial?.production_year ?? "");
  const [category, setCategory] = useState<TeaCategory | undefined>(
    initial?.tea_category,
  );
  const [leaf, setLeaf] = useState<LeafShape | undefined>(initial?.leaf_shape);
  const [compressed, setCompressed] = useState<Compressed | undefined>(
    initial?.is_compressed === true
      ? "예"
      : initial?.is_compressed === false
        ? "아니오"
        : undefined,
  );
  const [tool, setTool] = useState<BrewingToolEnum | undefined>(
    initial?.brewing_tool,
  );
  const [style, setStyle] = useState<string | undefined>(
    initial?.drinking_style,
  );
  const [memo, setMemo] = useState(initial?.user_memo ?? "");

  const canSubmit = !!category && !!tool;

  function collect(): TeaInfoValues {
    return {
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
    };
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {/* 기본 정보 */}
      <div className="flex flex-col gap-4">
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

      <div className="mt-6">
        <FieldLabel required>차 종류 </FieldLabel>
        <ChipGroup
          options={TEA_CATEGORIES}
          value={category}
          onChange={setCategory}
        />
      </div>

      <div className="mt-6">
        <FieldLabel>찻잎 형태</FieldLabel>
        <ChipGroup
          options={LEAF_SHAPES}
          value={leaf}
          onChange={setLeaf}
          activeClassName={TONE.brown}
        />
      </div>

      <div className="mt-6">
        <FieldLabel>압축차 여부</FieldLabel>
        <ChipGroup
          options={COMPRESSED_OPTIONS}
          value={compressed}
          onChange={setCompressed}
        />
      </div>

      <div className="mt-6">
        <FieldLabel required>사용 도구 </FieldLabel>
        <ChipGroup
          options={BREWING_TOOLS}
          value={tool}
          onChange={setTool}
          activeClassName={TONE.deep}
        />
      </div>

      <div className="mt-6">
        <FieldLabel>음용 방식</FieldLabel>
        <ChipGroup
          options={DRINKING_STYLES}
          value={style}
          onChange={(v) => setStyle(style === v ? undefined : v)}
          activeClassName={TONE.terracotta}
        />
      </div>

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

      {/* 액션 */}
      <button
        type="button"
        onClick={() => canSubmit && onSubmit(collect())}
        disabled={!canSubmit || pending}
        className="mt-7 flex w-full items-center justify-center gap-2 rounded-pill bg-brand px-6 py-4 text-[16px] font-bold text-white shadow-brand transition-colors hover:bg-brand-dark disabled:opacity-50"
      >
        {submitLabel}
      </button>

      {secondaryLabel && onSecondary && (
        <button
          type="button"
          onClick={() => canSubmit && onSecondary(collect())}
          disabled={!canSubmit || pending}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-pill border-2 border-brand px-6 py-[15px] text-[16px] font-bold text-brand transition-colors hover:bg-tint-green/40 disabled:opacity-50"
        >
          {secondaryLabel}
        </button>
      )}
    </div>
  );
}
