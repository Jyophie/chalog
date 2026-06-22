import Link from "next/link";
import { Archive, Camera, Newspaper, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "feed" | "archive" | "upload" | "my";

const TABS: { key: Tab; href: string; label: string; icon: typeof Newspaper }[] =
  [
    { key: "feed", href: "/feed", label: "피드", icon: Newspaper },
    { key: "archive", href: "/archive", label: "아카이브", icon: Archive },
    { key: "upload", href: "/upload", label: "등록", icon: Camera },
    { key: "my", href: "/my", label: "내 정보", icon: UserRound },
  ];

/** 메인 하단 내비게이션 — 미니멀, 색상만으로 활성 표시 */
export function BottomNav({ active }: { active: Tab }) {
  return (
    <nav className="pointer-events-none absolute inset-x-0 bottom-0 px-5 pb-3">
      <div className="pointer-events-auto flex items-center justify-around rounded-[20px] border border-hairline bg-field/95 py-2 shadow-[0px_-2px_10px_rgba(30,60,35,0.07)] backdrop-blur-sm">
        {TABS.map(({ key, href, label, icon: Icon }) => {
          const on = key === active;
          return (
            <Link
              key={key}
              href={href}
              className="flex flex-1 flex-col items-center gap-0.5 py-1"
            >
              <Icon
                className={cn(
                  "size-[19px]",
                  on ? "text-brand" : "text-ink-muted",
                )}
              />
              <span
                className={cn(
                  "text-[10px]",
                  on ? "font-bold text-brand" : "text-ink-muted",
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
