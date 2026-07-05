"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileWarning, MessageSquare } from "lucide-react";
import {
  useAdminReports,
  useResolveReport,
  type AdminReportItem,
} from "@/hooks/use-teas";
import { PhoneFrame } from "@/components/layout/phone-frame";
import { TopBar } from "@/components/layout/top-bar";

function fmt(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}.${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function ReportCard({ r }: { r: AdminReportItem }) {
  const resolve = useResolveReport();
  const isLog = r.target_type === "log";
  return (
    <div className="rounded-[16px] border border-hairline bg-field p-4 shadow-[0px_2px_6px_rgba(30,60,35,0.05)]">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 rounded-full bg-tint-cream px-2.5 py-1 text-[11px] font-bold text-[#8b6e52]">
          {isLog ? (
            <FileWarning className="size-3" />
          ) : (
            <MessageSquare className="size-3" />
          )}
          {isLog ? "기록" : "댓글"}
        </span>
        <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-500">
          {r.reason}
        </span>
        <span className="ml-auto text-[11px] text-ink-muted">
          {fmt(r.created_at)}
        </span>
      </div>

      <div className="mt-2.5 rounded-[10px] bg-paper px-3 py-2">
        {!r.exists ? (
          <p className="text-[12px] text-ink-muted">
            이미 삭제된 콘텐츠예요.
          </p>
        ) : isLog ? (
          <p className="text-[13px] text-brand-ink">
            기록 · {r.tea_name ?? "이름 미정"}
            {r.is_public === false && (
              <span className="ml-1 text-[11px] text-ink-muted">(비공개됨)</span>
            )}
          </p>
        ) : (
          <p className="line-clamp-2 text-[13px] text-brand-ink">
            “{r.comment_body}”
          </p>
        )}
        {r.log_id && r.exists && (
          <Link
            href={`/p/${r.log_id}`}
            className="mt-1 inline-block text-[12px] font-semibold text-brand"
          >
            원본 보기 →
          </Link>
        )}
      </div>

      <p className="mt-2 text-[11px] text-ink-muted">
        신고자: {r.reporter ?? "알 수 없음"}
      </p>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => resolve.mutate({ report_id: r.id, action: "dismiss" })}
          disabled={resolve.isPending}
          className="flex-1 rounded-pill border border-hairline bg-field py-2 text-[13px] font-bold text-brand-ink disabled:opacity-60"
        >
          무시
        </button>
        <button
          type="button"
          onClick={() => resolve.mutate({ report_id: r.id, action: "hide" })}
          disabled={resolve.isPending || !r.exists}
          className="flex-1 rounded-pill bg-red-500 py-2 text-[13px] font-bold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
        >
          {isLog ? "비공개 처리" : "댓글 삭제"}
        </button>
      </div>
    </div>
  );
}

export default function AdminReportsPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useAdminReports();
  const items = data?.items ?? [];

  return (
    <PhoneFrame>
      <TopBar title="신고 관리" onBack={() => router.back()} />
      <main className="flex flex-1 flex-col px-6 pt-2 pb-10">
        {isLoading && (
          <div className="flex flex-col gap-3">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-[16px] bg-tint-green/50"
              />
            ))}
          </div>
        )}

        {isError && (
          <div className="mt-24 flex flex-col items-center gap-3 text-center">
            <span className="text-5xl">🔒</span>
            <p className="text-[14px] text-ink-muted">
              운영자만 볼 수 있는 페이지예요.
            </p>
          </div>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <div className="mt-24 flex flex-col items-center gap-3 text-center">
            <span className="text-5xl">✅</span>
            <p className="text-[14px] text-ink-muted">처리할 신고가 없어요.</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {items.map((r) => (
            <ReportCard key={r.id} r={r} />
          ))}
        </div>
      </main>
    </PhoneFrame>
  );
}
