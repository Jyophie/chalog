"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Camera, ImageIcon, RefreshCw, Upload, X } from "lucide-react";
import { useScanFlow } from "@/store/scan-flow";
import { uploadTeaImage, UploadError } from "@/lib/storage";
import { PhoneFrame } from "@/components/layout/phone-frame";
import { TopBar } from "@/components/layout/top-bar";

const TIPS = [
  "패키지 앞면이 잘 보이도록 찍어요",
  "찻잎은 밝은 배경 위에 펼쳐 찍어요",
  "외국어·한자가 있으면 그대로 찍어도 돼요",
];

/** 점선 드롭존 모서리 데코 모티프 */
const DECOR = [
  { src: "/decor/leaf.svg", className: "left-3 top-3 size-6 -rotate-12 opacity-20" },
  { src: "/decor/star-anise.svg", className: "right-3 top-3 size-[22px] opacity-15" },
  { src: "/decor/pod.svg", className: "bottom-3 right-3 size-8 opacity-15" },
  { src: "/decor/drop.svg", className: "bottom-3 left-3 size-[22px] opacity-15" },
];

export function UploadForm() {
  const router = useRouter();
  const { imageFile, previewUrl, setImage, setImagePath, resetScanFlow } =
    useScanFlow();
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
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
    <PhoneFrame>
      <TopBar title="차 사진 올리기" onBack={() => router.push("/")} />

      <main className="flex flex-1 flex-col px-6 pt-2 pb-10">
        {/* 안내 배너 */}
        <div className="rounded-[16px] bg-tint-green px-4 py-3.5">
          <p className="text-[14px] font-semibold leading-[1.6] text-mark">
            차 패키지, 라벨, 찻잎 사진을 올려주세요.
          </p>
          <p className="text-[14px] leading-[1.6] text-ink-muted">
            AI가 텍스트와 시각적 단서를 함께 분석해요.
          </p>
        </div>

        {/* 숨김 파일 입력 (카메라 / 갤러리) */}
        <input
          ref={galleryRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={onPick}
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={onPick}
        />

        {/* 드롭존 / 미리보기 */}
        {previewUrl ? (
          <div className="mt-5">
            <div className="relative overflow-hidden rounded-[24px] border border-hairline bg-field">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="업로드한 차 사진"
                className="aspect-[4/3] w-full object-cover"
              />
              <button
                type="button"
                onClick={onRemove}
                aria-label="사진 삭제"
                className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            className="relative mt-5 flex h-[220px] w-full flex-col items-center justify-center overflow-hidden rounded-[24px] border-[2.5px] border-dashed border-hairline bg-field px-8 transition-colors hover:border-brand/40 hover:bg-tint-green/30"
          >
            {DECOR.map((d) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={d.src}
                src={d.src}
                alt=""
                aria-hidden
                className={`pointer-events-none absolute ${d.className}`}
              />
            ))}
            <span className="mb-3 grid size-16 place-items-center rounded-[16px] bg-tint-green">
              <Upload className="size-7 text-brand" />
            </span>
            <span className="text-[14px] font-bold text-brand-ink">
              사진을 끌어다 놓거나 직접 선택하세요
            </span>
            <span className="mt-1 text-[12px] text-ink-muted">
              JPG · PNG · WebP · 최대 10MB
            </span>
          </button>
        )}

        {/* 카메라 / 갤러리 버튼 */}
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="flex flex-1 items-center justify-center gap-2.5 rounded-[16px] border border-hairline bg-field py-[17px] text-[14px] font-bold text-brand-ink transition-colors hover:bg-tint-green/30"
          >
            <Camera className="size-5" /> 카메라
          </button>
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            className="flex flex-1 items-center justify-center gap-2.5 rounded-[16px] border border-hairline bg-field py-[17px] text-[14px] font-bold text-brand-ink transition-colors hover:bg-tint-green/30"
          >
            <ImageIcon className="size-5" /> 갤러리
          </button>
        </div>

        {/* 사진 팁 카드 */}
        <div className="mt-5 rounded-[20px] border border-hairline bg-field p-[17px] shadow-[0px_2px_6px_rgba(30,60,35,0.05)]">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/decor/leaf.svg" alt="" aria-hidden className="size-3.5" />
            <span className="text-[12px] font-bold text-brand-ink">사진 팁</span>
          </div>
          <ul className="mt-2 space-y-0.5">
            {TIPS.map((t) => (
              <li key={t} className="text-[12px] leading-[1.5] text-ink-muted">
                · {t}
              </li>
            ))}
          </ul>
        </div>

        {previewUrl && (
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            className="mt-4 flex items-center justify-center gap-2 text-[13px] font-semibold text-brand"
          >
            <RefreshCw className="size-4" /> 다른 사진 선택
          </button>
        )}

        {error && <p className="mt-4 text-[13px] text-red-500">{error}</p>}

        {/* CTA */}
        <button
          type="button"
          onClick={onStart}
          disabled={!imageFile || busy}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-pill bg-brand px-6 py-4 text-[16px] font-bold text-white shadow-brand transition-colors hover:bg-brand-dark disabled:opacity-50"
        >
          {busy ? "업로드 중…" : "AI 분석 시작하기"}
          {!busy && <ArrowRight className="size-[18px]" />}
        </button>
      </main>
    </PhoneFrame>
  );
}
