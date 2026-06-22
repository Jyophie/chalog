import { cn } from "@/lib/utils";

/**
 * 공통 앱 셸 (Figma: App + MobileShell).
 * 바깥 초록 그라데이션 배경 + 안쪽 크림 라운드 카드.
 *
 * 모바일: 카드가 뷰포트 높이(h-dvh)를 채우고 내용은 내부에서 스크롤.
 * PC(sm+): 카드를 실제 단말기처럼 고정 높이로 띄우고, 내용이 길어지면
 *          카드 안에서만 스크롤(바깥 그라데이션은 고정).
 *
 * `scroll`을 false로 주면 내부 스크롤 래퍼 없이 자식이 직접 셸을 채운다
 * (예: 자체적으로 sticky 헤더 + 스크롤 영역을 관리하는 화면).
 */
export function PhoneFrame({
  children,
  className,
  scroll = true,
}: {
  children: React.ReactNode;
  className?: string;
  scroll?: boolean;
}) {
  return (
    <div className="min-h-dvh w-full bg-[image:var(--gradient-app)] sm:grid sm:place-items-center sm:py-8">
      <div
        className={cn(
          "flex h-dvh w-full max-w-[400px] flex-col overflow-hidden bg-paper",
          "sm:h-[min(860px,calc(100dvh-4rem))] sm:rounded-[40px] sm:shadow-[0_32px_80px_rgba(30,60,35,0.28)] sm:ring-[6px] sm:ring-white/60",
          className,
        )}
      >
        {scroll ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
