import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { PhoneFrame } from "@/components/layout/phone-frame";
import { createClient } from "@/lib/supabase/server";

const FEATURES = [
  { icon: "📸", label: "사진 한 장으로 차 정보 자동 분석", bg: "bg-tint-green" },
  { icon: "🍵", label: "물 온도·시간·도구까지 맞춤 가이드", bg: "bg-tint-cream" },
  { icon: "📚", label: "내 차 컬렉션을 따뜻하게 기록", bg: "bg-tint-beige" },
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <PhoneFrame>
      <main className="flex min-h-full flex-col pb-8">
        {/* 헤더 + 히어로 (Figma Container 1:29) */}
        <div className="shrink-0">
          <div className="flex justify-center pt-14 pb-2">
            <Logo size="lg" />
          </div>
          {/* 히어로 이미지 + 굵은 헤드라인 두 줄만 오버레이 */}
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/landing/hero.png"
              alt="찻주전자와 찻잎 일러스트"
              className="block w-full"
              width={390}
              height={308}
            />
            <h1 className="absolute inset-x-0 bottom-[19%] px-6 text-center font-display text-[23px] font-black leading-[1.375] text-brand-ink">
              차 이름을 몰라도 괜찮아요.
              <br />
              <span className="text-brand">사진 한 장으로 시작해요</span>
            </h1>
          </div>
        </div>

        {/* 안내 + 핵심 가치 카드 */}
        <div className="shrink-0 px-6 pt-6">
          <p className="text-center text-[14px] text-ink-muted">
            AI가 분석하고, 나만의 티 아카이브로 쌓여요.
          </p>

          {/* 핵심 가치 카드 */}
          <div className="mt-6 flex flex-col gap-3">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className={`flex items-center gap-3 rounded-card ${f.bg} px-4 py-3`}
              >
                <span className="text-[20px] leading-none">{f.icon}</span>
                <span className="text-[14px] font-semibold text-brand-ink">
                  {f.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 남는 세로 공간을 흡수해 CTA를 하단으로 안정화 */}
        <div className="min-h-6 flex-1" />

        {/* CTA — 비로그인 시 로그인/회원가입으로 */}
        <div className="shrink-0 px-6">
          <Link
            href={user ? "/upload" : "/login?next=/upload"}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-pill bg-brand px-6 py-4 text-[16px] font-bold text-white shadow-brand transition-colors hover:bg-brand-dark"
          >
            차 사진 등록하기
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>

          {user ? (
            <Link
              href="/archive"
              className="mt-3 text-center text-[13px] font-semibold text-brand"
            >
              내 차 보관함 보기 →
            </Link>
          ) : (
            <p className="mt-3 text-center text-[12px] text-ink-muted">
              무료로 시작할 수 있어요 ✨
            </p>
          )}
        </div>
      </main>
    </PhoneFrame>
  );
}
