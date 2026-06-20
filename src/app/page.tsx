/**
 * 임시 랜딩 (스캐폴딩 확인용).
 * 실제 ① 랜딩 화면은 Figma node 1:2 기준으로 다음 단계에서 구현.
 */
export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="flex flex-col items-center gap-1">
        <span className="font-display text-4xl font-black text-brand">
          chalog
        </span>
        <span className="text-xs text-ink-muted">차 한 잔의 기록</span>
      </div>

      <h1 className="font-display text-2xl font-black leading-snug text-brand-ink">
        차 이름을 몰라도 괜찮아요.
        <br />
        <span className="text-brand">사진 한 장으로 시작해요</span>
      </h1>
      <p className="text-sm text-ink-muted">
        AI가 분석하고, 나만의 티 아카이브로 쌓여요.
      </p>

      <div className="mt-2 flex w-full flex-col gap-2.5">
        <div className="flex items-center gap-3 rounded-card bg-tint-green px-4 py-3 text-left text-sm font-semibold text-brand-ink">
          📸 사진 한 장으로 차 정보 자동 분석
        </div>
        <div className="flex items-center gap-3 rounded-card bg-tint-cream px-4 py-3 text-left text-sm font-semibold text-brand-ink">
          🍵 물 온도·시간·도구까지 맞춤 가이드
        </div>
        <div className="flex items-center gap-3 rounded-card bg-tint-beige px-4 py-3 text-left text-sm font-semibold text-brand-ink">
          📚 내 차 컬렉션을 따뜻하게 기록
        </div>
      </div>

      <button
        type="button"
        className="mt-2 w-full rounded-pill bg-brand px-6 py-4 font-display font-bold text-white shadow-brand transition-colors hover:bg-brand-dark"
      >
        차 사진 등록하기
      </button>

      <p className="text-xs text-ink-muted">
        🧱 스캐폴딩 완료 · 화면 구현은 다음 단계
      </p>
    </main>
  );
}
