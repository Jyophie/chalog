import { cn } from "@/lib/utils";

/**
 * Chalog 로고 (마크 + 워드마크).
 * NOTE: 마크는 임시 이모지 — Figma의 ChalogMark SVG로 교체 예정.
 */
export function Logo({
  size = "md",
  withTagline = true,
  className,
}: {
  size?: "sm" | "md" | "lg";
  withTagline?: boolean;
  className?: string;
}) {
  const mark = { sm: "size-9 text-lg", md: "size-11 text-xl", lg: "size-14 text-2xl" }[size];
  const word = { sm: "text-2xl", md: "text-3xl", lg: "text-4xl" }[size];

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="flex items-center gap-2">
        <span className={cn("grid place-items-center rounded-[14px] bg-brand", mark)}>
          🍵
        </span>
        <span className={cn("font-display font-black text-brand", word)}>
          chalog
        </span>
      </div>
      {withTagline && (
        <span className="text-xs text-ink-muted">차 한 잔의 기록</span>
      )}
    </div>
  );
}
