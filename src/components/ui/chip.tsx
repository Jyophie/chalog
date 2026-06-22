"use client";

import { cn } from "@/lib/utils";

export function Chip({
  selected,
  activeClassName,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
  /** 선택됐을 때 색 (그룹마다 다름). 미지정 시 브랜드 그린. */
  activeClassName?: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-full border-[1.5px] px-4 py-2 text-[14px] font-semibold transition-colors",
        selected
          ? (activeClassName ??
            "border-brand bg-brand text-white shadow-[0px_2px_5px_rgba(74,124,89,0.19)]")
          : "border-hairline bg-field text-ink-muted hover:bg-tint-green/40",
        className,
      )}
      {...props}
    />
  );
}
