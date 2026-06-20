"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useScanFlow } from "@/store/scan-flow";
import { analysisResultSchema } from "@/lib/schemas/tea";
import { Button } from "@/components/ui/button";

/** ④ AI 분석 (로딩) */
export default function AnalyzePage() {
  const router = useRouter();
  const { imagePath, previewUrl, setAnalysisResult } = useScanFlow();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  async function run() {
    setError(null);
    try {
      const res = await fetch("/api/analyze-tea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagePath }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAnalysisResult(analysisResultSchema.parse(data));
      router.replace("/result");
    } catch {
      setError("분석에 실패했어요. 다시 시도해주세요.");
    }
  }

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (!imagePath) {
      router.replace("/upload");
      return;
    }
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col items-center justify-center gap-6 px-6 text-center">
      {previewUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt=""
          className="size-28 rounded-[20px] object-cover opacity-90"
        />
      )}

      {error ? (
        <>
          <p className="text-sm text-red-500">{error}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="md" onClick={() => router.replace("/upload")}>
              다시 올리기
            </Button>
            <Button size="md" onClick={run}>
              다시 시도
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <span className="size-3 animate-bounce rounded-full bg-brand [animation-delay:-0.3s]" />
            <span className="size-3 animate-bounce rounded-full bg-brand [animation-delay:-0.15s]" />
            <span className="size-3 animate-bounce rounded-full bg-brand" />
          </div>
          <div>
            <p className="font-display text-lg font-black text-brand-ink">
              차를 살펴보는 중이에요
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              라벨과 찻잎을 분석하고 있어요…
            </p>
          </div>
        </>
      )}
    </main>
  );
}
