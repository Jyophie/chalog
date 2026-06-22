"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Heart, Leaf, MessageCircle, Send, Trash2 } from "lucide-react";
import {
  usePublicLog,
  useToggleLike,
  useComments,
  useAddComment,
  useDeleteComment,
} from "@/hooks/use-teas";
import { PhoneFrame } from "@/components/layout/phone-frame";
import { cn } from "@/lib/utils";

function LeafRating({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Leaf
          key={n}
          className={cn(
            "size-3.5",
            n <= value ? "fill-brand text-brand" : "text-ink-muted/30",
          )}
        />
      ))}
    </div>
  );
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/** 댓글 섹션 */
function CommentsSection({ logId }: { logId: string }) {
  const router = useRouter();
  const { data } = useComments(logId);
  const add = useAddComment(logId);
  const del = useDeleteComment(logId);
  const [text, setText] = useState("");
  const comments = data?.comments ?? [];

  function submit() {
    const body = text.trim();
    if (!body) return;
    add.mutate(body, { onSuccess: () => setText("") });
  }

  return (
    <div className="mt-8">
      <h2 className="text-[14px] font-black text-brand-ink">
        댓글 {comments.length > 0 && `(${comments.length})`}
      </h2>

      <ul className="mt-3 flex flex-col gap-3">
        {comments.map((c) => {
          const canDelete = data?.is_owner || data?.me === c.user_id;
          return (
            <li key={c.id} className="flex gap-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand text-[13px] font-black text-white">
                {(c.author || "?").charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-brand-ink">
                    {c.author ?? "차 애호가"}
                  </span>
                  <span className="text-[11px] text-ink-muted">
                    {fmtDate(c.created_at)}
                  </span>
                  {canDelete && (
                    <button
                      type="button"
                      aria-label="댓글 삭제"
                      onClick={() => del.mutate(c.id)}
                      className="ml-auto text-ink-muted/60 transition-colors hover:text-red-500"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
                <p className="mt-0.5 whitespace-pre-wrap break-words text-[13px] leading-relaxed text-brand-ink">
                  {c.body}
                </p>
              </div>
            </li>
          );
        })}
        {comments.length === 0 && (
          <li className="text-[13px] text-ink-muted">첫 댓글을 남겨보세요.</li>
        )}
      </ul>

      {data?.is_authed ? (
        <div className="mt-4 flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) submit();
            }}
            maxLength={1000}
            placeholder="댓글을 남겨보세요"
            className="h-[46px] flex-1 rounded-[16px] border border-hairline bg-field px-4 text-[14px] text-brand-ink outline-none transition-colors placeholder:text-[#1e2b2080] focus:border-brand"
          />
          <button
            type="button"
            onClick={submit}
            disabled={add.isPending || !text.trim()}
            aria-label="댓글 등록"
            className="grid size-[46px] shrink-0 place-items-center rounded-[16px] bg-brand text-white shadow-brand transition-colors hover:bg-brand-dark disabled:opacity-50"
          >
            <Send className="size-[18px]" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => router.push(`/login?next=/p/${logId}`)}
          className="mt-4 w-full rounded-pill border border-hairline bg-field py-3 text-[14px] font-bold text-brand-ink"
        >
          로그인하고 댓글 남기기
        </button>
      )}
    </div>
  );
}

function Cond({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <span className="rounded-full bg-tint-green px-3 py-1 text-[12px] font-semibold text-mark">
      {label} {value}
    </span>
  );
}

/** 공개 시음 기록 상세 (id = log id, 읽기 전용, 비로그인 포함) */
export default function PublicLogPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = usePublicLog(id);
  const like = useToggleLike(id);

  if (isLoading) {
    return (
      <PhoneFrame>
        <div className="px-6 pt-14">
          <div className="h-40 w-full animate-pulse rounded-[24px] bg-tint-green/50" />
        </div>
      </PhoneFrame>
    );
  }
  if (isError || !data) {
    return (
      <PhoneFrame>
        <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <span className="text-5xl">🫖</span>
          <p className="text-[14px] text-ink-muted">
            공개되지 않았거나 삭제된 기록이에요.
          </p>
          <button
            type="button"
            onClick={() => router.push("/feed")}
            className="rounded-pill border border-hairline bg-field px-5 py-2.5 text-[14px] font-bold text-brand-ink"
          >
            피드로
          </button>
        </main>
      </PhoneFrame>
    );
  }

  const { log, tea, author } = data;
  const thumb = tea?.image_url ?? log.photo_url ?? null;
  const teaMeta = [tea?.tea_category, tea?.origin].filter(Boolean).join(" · ");

  return (
    <PhoneFrame>
      {/* 헤더 — 차 맥락 */}
      <div className="border-b border-hairline px-6 pt-14 pb-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="뒤로"
            className="grid size-10 place-items-center rounded-full bg-track text-brand-ink transition-colors hover:bg-[#e3ddd0]"
          >
            <ArrowLeft className="size-[18px]" />
          </button>
          <div className="flex items-center gap-3 text-[13px] font-semibold text-ink-muted">
            <button
              type="button"
              aria-label="좋아요"
              onClick={() => {
                if (!data.is_authed) {
                  router.push(`/login?next=/p/${id}`);
                  return;
                }
                like.mutate(data.liked_by_me);
              }}
              className="flex items-center gap-1 transition-transform active:scale-90"
            >
              <Heart
                className={cn(
                  "size-4 transition-colors",
                  data.liked_by_me && "fill-[#d4714a] text-[#d4714a]",
                )}
              />
              {log.like_count}
            </button>
            <span className="flex items-center gap-1">
              <MessageCircle className="size-4" />
              {log.comment_count}
            </span>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-4">
          <div className="size-16 shrink-0 overflow-hidden rounded-[20px] bg-tint-green">
            {thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumb} alt="" className="size-full object-cover" />
            ) : (
              <div className="grid size-full place-items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/decor/teacup.svg" alt="" className="size-8" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[20px] font-black text-brand-ink">
              {tea?.tea_name || "이름 미정"}
            </h1>
            {teaMeta && (
              <p className="mt-0.5 text-[12px] text-ink-muted">{teaMeta}</p>
            )}
            <p className="mt-0.5 text-[12px] font-semibold text-brand">
              by {author ?? "차 애호가"}
            </p>
          </div>
        </div>
      </div>

      <main className="flex flex-1 flex-col px-6 pt-5 pb-10">
        {/* 기록 본문 */}
        <div className="rounded-[20px] border border-hairline bg-field p-5 shadow-[0px_2px_6px_rgba(30,60,35,0.05)]">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-black text-brand-ink">
              {log.brewed_at}
            </span>
            {log.rating != null && <LeafRating value={log.rating} />}
          </div>

          {log.photo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={log.photo_url}
              alt="찻자리 사진"
              className="mt-3 aspect-video w-full rounded-[14px] object-cover"
            />
          )}

          {(log.water_temperature ||
            log.steeping_time ||
            log.tea_amount ||
            log.tool) && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Cond label="🌡️" value={log.water_temperature} />
              <Cond label="⏱️" value={log.steeping_time} />
              <Cond label="🍃" value={log.tea_amount} />
              <Cond label="🫖" value={log.tool} />
            </div>
          )}

          {log.taste_memo && (
            <p className="mt-3 text-[13px] leading-relaxed text-brand-ink">
              <span className="font-bold text-ink-muted">맛 · </span>
              {log.taste_memo}
            </p>
          )}
          {log.aroma_memo && (
            <p className="mt-1 text-[13px] leading-relaxed text-brand-ink">
              <span className="font-bold text-ink-muted">향 · </span>
              {log.aroma_memo}
            </p>
          )}
          {log.next_adjustment && (
            <p className="mt-2 text-[12px] font-semibold text-brand">
              다음엔 · {log.next_adjustment}
            </p>
          )}
        </div>

        {/* 댓글 */}
        <CommentsSection logId={id} />
      </main>
    </PhoneFrame>
  );
}
