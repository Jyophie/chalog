import { cn } from "@/lib/utils";

/**
 * Chalog 브랜드 락업 (Figma: ChalogLogo).
 * 마크(딥그린 라운드 배지 + 흰 찻잎) + "chalog" 세리프 워드마크 + 태그라인.
 */
const SIZES = {
  sm: {
    gap: "gap-2.5",
    mark: "size-8",
    word: "text-[24px] leading-[24px]",
    tag: "mt-[2px] text-[8px] tracking-[2px]",
  },
  md: {
    gap: "gap-3",
    mark: "size-10",
    word: "text-[30px] leading-[30px]",
    tag: "mt-[2px] text-[9px] tracking-[2.5px]",
  },
  lg: {
    gap: "gap-[13px]",
    mark: "size-[47px]",
    word: "text-[36px] leading-[36px]",
    tag: "mt-[3px] text-[10px] tracking-[3px]",
  },
} as const;

export function Logo({
  size = "md",
  withTagline = true,
  className,
}: {
  size?: "sm" | "md" | "lg";
  withTagline?: boolean;
  className?: string;
}) {
  const s = SIZES[size];

  return (
    <div className={cn("flex items-center", s.gap, className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/chalog-mark.svg"
        alt="chalog"
        className={cn("shrink-0", s.mark)}
      />
      <div className="flex flex-col items-start">
        <p
          className={cn(
            "font-wordmark font-extrabold tracking-[-0.5px] text-brand-ink",
            s.word,
          )}
        >
          cha<span className="font-bold text-brand">log</span>
        </p>
        {withTagline && (
          <span className={cn("font-medium text-ink-muted", s.tag)}>
            차 한 잔의 기록
          </span>
        )}
      </div>
    </div>
  );
}
