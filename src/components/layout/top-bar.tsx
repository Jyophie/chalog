"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/**
 * 공통 상단바 (Figma: TopBar).
 * 좌측 원형 뒤로가기 + 가운데 제목 + 우측 슬롯(없으면 40px 스페이서로 중앙정렬 유지).
 * PhoneFrame 내부 스크롤 영역에 들어가는 전제 — 상단 56px 여백 포함.
 */
export function TopBar({
  title,
  right,
  onBack,
}: {
  title?: string;
  right?: React.ReactNode;
  onBack?: () => void;
}) {
  const router = useRouter();
  return (
    <header className="flex shrink-0 items-center justify-between px-6 pt-14 pb-4">
      <button
        type="button"
        onClick={() => (onBack ? onBack() : router.back())}
        aria-label="뒤로"
        className="grid size-10 place-items-center rounded-full bg-track text-brand-ink transition-colors hover:bg-[#e3ddd0]"
      >
        <ArrowLeft className="size-[18px]" />
      </button>
      {title ? (
        <h1 className="text-[14px] font-bold text-brand-ink">{title}</h1>
      ) : (
        <span />
      )}
      <div className="grid size-10 place-items-center">{right}</div>
    </header>
  );
}
