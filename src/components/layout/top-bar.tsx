"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

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
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between bg-bg/80 px-3 backdrop-blur-sm">
      <button
        type="button"
        onClick={() => (onBack ? onBack() : router.back())}
        aria-label="뒤로"
        className="grid size-10 place-items-center rounded-full text-brand-ink transition-colors hover:bg-tint-green"
      >
        <ChevronLeft className="size-5" />
      </button>
      {title ? (
        <h1 className="font-display text-base font-bold text-brand-ink">
          {title}
        </h1>
      ) : (
        <span />
      )}
      <div className="grid size-10 place-items-center">{right}</div>
    </header>
  );
}
