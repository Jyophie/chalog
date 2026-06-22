"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { cn } from "@/lib/utils";

const REASONS = ["스팸/광고", "부적절한 내용", "혐오/괴롭힘", "기타"];

/** 공개 기록·댓글 신고 (사유 선택 후 즉시 접수) */
export function ReportButton({
  targetType,
  targetId,
  label = "신고",
  className,
}: {
  targetType: "log" | "comment";
  targetId: string;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(reason: string) {
    setBusy(true);
    try {
      await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_type: targetType,
          target_id: targetId,
          reason,
        }),
      });
      setDone(true);
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <span className={cn("text-[12px] text-ink-muted", className)}>
        신고가 접수됐어요
      </span>
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-[12px] text-ink-muted transition-colors hover:text-red-500"
      >
        <Flag className="size-3.5" /> {label}
      </button>
      {open && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {REASONS.map((r) => (
            <button
              key={r}
              type="button"
              disabled={busy}
              onClick={() => submit(r)}
              className="rounded-full border border-hairline bg-field px-2.5 py-1 text-[11px] text-brand-ink transition-colors hover:bg-tint-green/40 disabled:opacity-50"
            >
              {r}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
