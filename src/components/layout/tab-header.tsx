import { Logo } from "@/components/brand/logo";

/**
 * 메인 탭 공용 헤더 (피드·아카이브·등록·내정보).
 * 상단 왼쪽에 서비스명(chalog), 그 아래 컴팩트한 페이지명 + 짧은 설명.
 */
export function TabHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="px-6 pt-9 pb-2.5">
      <div className="flex items-center justify-between">
        <Logo size="sm" withTagline={false} />
        {action}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <h1 className="shrink-0 text-[17px] font-black text-brand-ink">
          {title}
        </h1>
        {subtitle && (
          <p className="truncate text-[12px] text-ink-muted">{subtitle}</p>
        )}
      </div>
    </header>
  );
}
