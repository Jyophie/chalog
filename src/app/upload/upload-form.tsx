"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, RefreshCw, X } from "lucide-react";
import { useScanFlow } from "@/store/scan-flow";
import { uploadTeaImage, UploadError } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/layout/top-bar";

export function UploadForm() {
  const router = useRouter();
  const { imageFile, previewUrl, setImage, setImagePath, resetScanFlow } =
    useScanFlow();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setError(null);
    resetScanFlow(); // 새 이미지 → 이전 분석/가이드 초기화
    setImage(f);
    e.target.value = "";
  }

  function onRemove() {
    setImage(null);
    setError(null);
  }

  async function onStart() {
    if (!imageFile) return;
    setBusy(true);
    setError(null);
    try {
      const path = await uploadTeaImage(imageFile);
      setImagePath(path);
      router.push("/analyze");
    } catch (e) {
      setError(
        e instanceof UploadError ? e.message : "업로드 중 문제가 생겼어요.",
      );
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col">
      <TopBar title="차 사진 등록" onBack={() => router.push("/")} />

      <main className="flex flex-1 flex-col px-6 pb-8">
        <p className="mt-2 text-sm text-ink-muted">
          차 패키지, 라벨, 찻잎 사진을 올리면 AI가 분석해드려요.
        </p>

        {/* 업로드 영역 */}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={onPick}
        />

        {previewUrl ? (
          <div className="mt-6">
            <div className="relative overflow-hidden rounded-[20px] border border-border bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="업로드한 차 사진"
                className="aspect-[4/3] w-full object-cover"
              />
              <button
                type="button"
                onClick={onRemove}
                aria-label="삭제"
                className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-black/50 text-white"
              >
                <X className="size-4" />
              </button>
            </div>
            <Button
              type="button"
              variant="outline"
              size="md"
              block
              className="mt-3"
              onClick={() => inputRef.current?.click()}
            >
              <RefreshCw className="size-4" /> 다른 사진 선택
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-6 flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-[20px] border-2 border-dashed border-border bg-surface text-ink-muted transition-colors hover:border-brand hover:bg-tint-green/40"
          >
            <ImagePlus className="size-10" />
            <span className="text-sm font-semibold">사진 올리기</span>
            <span className="text-xs">JPG · PNG · WebP · 최대 10MB</span>
          </button>
        )}

        {/* 가이드 문구 */}
        <ul className="mt-6 space-y-2 rounded-card bg-tint-cream/60 p-4 text-xs text-ink-muted">
          <li>· 라벨의 글자가 잘 보이게 찍으면 분석이 정확해져요.</li>
          <li>· 찻잎 사진을 함께 올리면 더 좋아요.</li>
        </ul>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        <div className="flex-1" />

        <Button
          type="button"
          size="lg"
          block
          className="mt-6"
          disabled={!imageFile || busy}
          onClick={onStart}
        >
          {busy ? "업로드 중…" : "분석 시작"}
        </Button>
      </main>
    </div>
  );
}
