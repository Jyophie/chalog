"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** 사진 캐러셀 (필터 없이 사진만, 가로 스와이프) */
export function PhotoCarousel({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0);

  if (images.length === 0) {
    return (
      <div className="grid aspect-square w-full place-items-center bg-tint-green">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/decor/teacup.svg" alt="" aria-hidden className="size-12 opacity-70" />
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        onScroll={(e) => {
          const el = e.currentTarget;
          const i = Math.round(el.scrollLeft / el.clientWidth);
          if (i !== idx) setIdx(i);
        }}
        className="flex aspect-square snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={src}
            alt=""
            className="aspect-square w-full shrink-0 snap-center object-cover"
          />
        ))}
      </div>

      {images.length > 1 && (
        <>
          <div className="absolute right-3 top-3 rounded-full bg-black/45 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">
            {idx + 1}/{images.length}
          </div>
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "size-1.5 rounded-full transition-colors",
                  i === idx ? "bg-white" : "bg-white/50",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
