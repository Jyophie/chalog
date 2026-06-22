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

/** 메인 하단 내비게이션 (PhoneFrame scroll={false} 안에서 absolute 오버레이) */
export function BottomNav({ active }: { active: Tab }) {
  return (
    <nav className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-4">
      <div className="pointer-events-auto flex items-center justify-around rounded-[24px] border border-hairline bg-field py-3 shadow-[0px_-2px_10px_rgba(30,60,35,0.09)]">
        {TABS.map(({ key, href, label, icon: Icon }) => {
          const on = key === active;
          const isUpload = key === "upload";
          return (
            <Link
              key={key}
              href={href}
              className="flex flex-col items-center gap-1"
            >
              <span
                className={cn(
                  "grid size-10 place-items-center rounded-[16px]",
                  isUpload ? "bg-brand" : on ? "bg-tint-green" : "bg-transparent",
                )}
              >
                <Icon
                  className={cn(
                    "size-5",
                    isUpload
                      ? "text-white"
                      : on
                        ? "text-brand"
                        : "text-ink-muted",
                  )}
                />
              </span>
              <span
                className={cn(
                  "text-[12px]",
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
