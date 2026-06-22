"use client";

import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const clampSec = (n: number) => Math.min(900, Math.max(5, Math.round(n)));

/** 초 → "M:SS" 또는 "N초" 표기 */
function formatTime(s: number): string {
  return s >= 60
    ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
    : `${s}초`;
}

export type Pour = { label: string; seconds: number };

/**
 * 권장 우림 시간(범위)을 1~3포 일정으로 펼친다.
 * 범위가 있으면 [낮음, 중간, 높음], 단일값이면 +5s씩 늘려 후속 포를 잡는다.
 */
export function derivePours(steeping?: string | null): Pour[] {
  const isMin = /분/.test(steeping ?? "") && !/초/.test(steeping ?? "");
  const f = isMin ? 60 : 1;
  const nums = (steeping ?? "").match(/\d+/g)?.map((n) => Number(n) * f) ?? [];
  let lo = nums[0] ?? 30;
  let hi = nums[1] ?? lo;
  if (lo > hi) [lo, hi] = [hi, lo];
  const secs =
    lo === hi ? [lo, lo + 5, lo + 10] : [lo, Math.round((lo + hi) / 2), hi];
  return secs.map((s, i) => ({ label: `${i + 1}포`, seconds: clampSec(s) }));
}

/** 원형(채워지는) 카운트다운 우림 타이머 — 1~3포 선택 */
export function BrewTimer({ pours }: { pours: Pour[] }) {
  const [idx, setIdx] = useState(0);
  const base = pours[idx]?.seconds ?? 30;
  const [remaining, setRemaining] = useState(base);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setRemaining(pours[idx]?.seconds ?? 30);
    setRunning(false);
  }, [idx, pours]);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      setRunning(false);
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [running, remaining]);

  const R = 62;
  const C = 2 * Math.PI * R;
  const elapsed = base > 0 ? (base - remaining) / base : 0; // 0→1 진행
  const done = remaining <= 0;
  const status = done ? "다 우러났어요 ✨" : running ? "우리는 중" : "대기 중";

  return (
    <div className="flex flex-col items-center">
      {/* 포 선택 탭 */}
      <div className="flex w-full gap-2">
        {pours.map((p, i) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setIdx(i)}
            className={cn(
              "flex-1 rounded-[24px] py-2 text-center transition-colors",
              i === idx
                ? "bg-brand text-white shadow-[0px_2px_4px_rgba(74,124,89,0.21)]"
                : "bg-track text-ink-muted",
            )}
          >
            <div className="text-[14px] font-bold">{p.label}</div>
            <div className="text-[12px] opacity-80">{formatTime(p.seconds)}</div>
          </button>
        ))}
      </div>

      <div className="relative mt-5 size-[140px]">
        <svg className="size-full -rotate-90" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={R} fill="none" stroke="var(--color-track)" strokeWidth="8" />
          {/* 시간이 갈수록 차오른다 */}
          <circle
            cx="70"
            cy="70"
            r={R}
            fill="none"
            stroke="var(--color-brand)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - elapsed)}
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[32px] font-black tabular-nums text-brand-ink">
            {formatTime(remaining)}
          </span>
          <span className="mt-0.5 text-[12px] text-ink-muted">{status}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setRemaining(base);
            setRunning(false);
          }}
          aria-label="초기화"
          className="grid size-10 place-items-center rounded-full bg-track text-brand-ink transition-colors hover:bg-[#e3ddd0]"
        >
          <RotateCcw className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            if (done) setRemaining(base);
            setRunning((r) => !r);
          }}
          className="flex items-center gap-2 rounded-full bg-brand px-8 py-2.5 text-[14px] font-bold text-white shadow-brand transition-colors hover:bg-brand-dark"
        >
          {running ? <Pause className="size-4" /> : <Play className="size-4" />}
          {running ? "일시정지" : done ? "다시" : "시작"}
        </button>
      </div>
    </div>
  );
}
