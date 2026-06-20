import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FEATURES = [
  { icon: "📸", label: "사진 한 장으로 차 정보 자동 분석", bg: "bg-tint-green" },
  { icon: "🍵", label: "물 온도·시간·도구까지 맞춤 가이드", bg: "bg-tint-cream" },
  { icon: "📚", label: "내 차 컬렉션을 따뜻하게 기록", bg: "bg-tint-beige" },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col px-6 pb-10 pt-8">
      {/* 로고 */}
      <div className="flex justify-center">
        <Logo size="md" />
      </div>

      {/* 히어로 (Figma HeroPoster 단순화 버전) */}
      <div className="relative mt-6 flex h-56 items-center justify-center overflow-hidden rounded-[24px] bg-gradient-to-br from-tint-green via-tint-cream to-tint-beige">
        <span className="text-7xl drop-shadow-sm">🍵</span>
        <span className="absolute left-6 top-6 text-2xl">🌿</span>
        <span className="absolute right-7 top-8 text-2xl">🍃</span>
        <span className="absolute bottom-7 left-9 text-2xl">💧</span>
        <span className="absolute bottom-6 right-8 text-2xl">🫖</span>
      </div>

      {/* 헤드라인 */}
      <h1 className="mt-8 text-center font-display text-2xl font-black leading-snug text-brand-ink">
        차 이름을 몰라도 괜찮아요.
        <br />
        <span className="text-brand">사진 한 장으로 시작해요</span>
      </h1>
      <p className="mt-3 text-center text-sm text-ink-muted">
        AI가 분석하고, 나만의 티 아카이브로 쌓여요.
      </p>

      {/* 핵심 가치 카드 */}
      <div className="mt-6 flex flex-col gap-2.5">
        {FEATURES.map((f) => (
          <div
            key={f.label}
            className={`flex items-center gap-3 rounded-card ${f.bg} px-4 py-3`}
          >
            <span className="text-xl">{f.icon}</span>
            <span className="text-sm font-semibold text-brand-ink">
              {f.label}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <Link
          href="/upload"
          className={cn(buttonVariants({ size: "lg", block: true }))}
        >
          차 사진 등록하기
        </Link>
        <p className="text-xs text-ink-muted">무료로 시작할 수 있어요 ✨</p>
      </div>
    </main>
  );
}
