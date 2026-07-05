"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  Leaf,
  MessageCircle,
  Pencil,
  Send,
  Share2,
  Trash2,
} from "lucide-react";
import {
  usePublicLog,
  useToggleLike,
  useDeleteLog,
  useComments,
  useAddComment,
  useDeleteComment,
  type CommentItem,
} from "@/hooks/use-teas";
import { PhoneFrame } from "@/components/layout/phone-frame";
import { PhotoCarousel } from "@/components/photo-carousel";
import { Avatar } from "@/components/ui/avatar";
import { ReportButton } from "@/components/report-button";
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

/** 댓글 섹션 (대댓글 한 단계 + 신고) */
function CommentsSection({ logId }: { logId: string }) {
  const router = useRouter();
  const { data } = useComments(logId);
  const add = useAddComment(logId);
  const del = useDeleteComment(logId);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const comments = data?.comments ?? [];
  const top = comments.filter((c) => !c.parent_id);
  const repliesByParent: Record<string, CommentItem[]> = {};
  comments.forEach((c) => {
    if (c.parent_id) (repliesByParent[c.parent_id] ??= []).push(c);
  });

  const me = data?.me;
  const isAuthed = data?.is_authed ?? false;

  function submitTop() {
    const body = text.trim();
    if (!body) return;
    add.mutate({ body }, { onSuccess: () => setText("") });
  }
  function submitReply(parentId: string) {
    const body = replyText.trim();
    if (!body) return;
    add.mutate(
      { body, parentId },
      {
        onSuccess: () => {
          setReplyText("");
          setReplyTo(null);
        },
      },
    );
  }

  const renderComment = (c: CommentItem, isReply: boolean) => {
    const canDelete = data?.is_owner || me === c.user_id;
    const canReport = isAuthed && me !== c.user_id;
    return (
      <div key={c.id} className={cn("flex gap-2.5", isReply && "ml-10")}>
        <Avatar
          src={c.author_avatar}
          name={c.author}
          className={isReply ? "size-7" : "size-8"}
          fontClassName="text-[12px]"
        />
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
          {(isAuthed || canReport) && (
            <div className="mt-1 flex items-center gap-3">
              {isAuthed && !isReply && (
                <button
                  type="button"
                  onClick={() => {
                    setReplyTo(replyTo === c.id ? null : c.id);
                    setReplyText("");
                  }}
                  className="text-[12px] font-semibold text-ink-muted transition-colors hover:text-brand"
                >
                  답글
                </button>
              )}
              {canReport && (
                <ReportButton targetType="comment" targetId={c.id} />
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-8">
      <h2 className="text-[14px] font-black text-brand-ink">
        댓글 {comments.length > 0 && `(${comments.length})`}
      </h2>

      <div className="mt-3 flex flex-col gap-4">
        {top.map((c) => (
          <div key={c.id} className="flex flex-col gap-3">
            {renderComment(c, false)}
            {(repliesByParent[c.id] ?? []).map((r) => renderComment(r, true))}
            {replyTo === c.id && isAuthed && (
              <div className="ml-10 flex items-center gap-2">
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.nativeEvent.isComposing)
                      submitReply(c.id);
                  }}
                  maxLength={1000}
                  autoFocus
                  placeholder={`${c.author ?? "차 애호가"}님에게 답글`}
                  className="h-[42px] flex-1 rounded-[14px] border border-hairline bg-field px-3.5 text-[13px] text-brand-ink outline-none transition-colors placeholder:text-[#1e2b2080] focus:border-brand"
                />
                <button
                  type="button"
                  onClick={() => submitReply(c.id)}
                  disabled={add.isPending || !replyText.trim()}
                  aria-label="답글 등록"
                  className="grid size-[42px] shrink-0 place-items-center rounded-[14px] bg-brand text-white shadow-brand transition-colors hover:bg-brand-dark disabled:opacity-50"
                >
                  <Send className="size-4" />
                </button>
              </div>
            )}
          </div>
        ))}
        {top.length === 0 && (
          <p className="text-[13px] text-ink-muted">첫 댓글을 남겨보세요.</p>
        )}
      </div>

      {isAuthed ? (
        <div className="mt-4 flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) submitTop();
            }}
            maxLength={1000}
            placeholder="댓글을 남겨보세요"
            className="h-[46px] flex-1 rounded-[16px] border border-hairline bg-field px-4 text-[14px] text-brand-ink outline-none transition-colors placeholder:text-[#1e2b2080] focus:border-brand"
          />
          <button
            type="button"
            onClick={submitTop}
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
export function PublicLogClient() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = usePublicLog(id);
  const like = useToggleLike(id);
  const delLog = useDeleteLog(data?.tea?.id ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [shared, setShared] = useState(false);

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
  const thumb = tea?.image_url ?? log.images[0] ?? null;
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
            <button
              type="button"
              aria-label="공유"
              onClick={async () => {
                const url = `${window.location.origin}/p/${id}`;
                const title = `${tea?.tea_name ?? "차 기록"} · chalog`;
                if (navigator.share) {
                  try {
                    await navigator.share({ title, url });
                  } catch {
                    /* 사용자 취소 */
                  }
                } else {
                  await navigator.clipboard.writeText(url);
                  setShared(true);
                  setTimeout(() => setShared(false), 1500);
                }
              }}
              className="flex items-center gap-1 transition-transform active:scale-90"
            >
              <Share2 className="size-4" />
              {shared && <span className="text-[12px]">복사됨</span>}
            </button>
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
            {tea?.user_id ? (
              <Link
                href={`/u/${tea.user_id}`}
                className="mt-1 inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand"
              >
                <Avatar
                  src={data.author_avatar}
                  name={author}
                  className="size-4"
                  fontClassName="text-[8px]"
                />
                {author ?? "차 애호가"}
              </Link>
            ) : (
              <p className="mt-0.5 text-[12px] font-semibold text-brand">
                by {author ?? "차 애호가"}
              </p>
            )}
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

          {log.images.length > 0 && (
            <div className="mt-3 overflow-hidden rounded-[14px] border border-hairline">
              <PhotoCarousel images={log.images} />
            </div>
          )}

          {/* 노트 (주요 내용) */}
          {log.next_adjustment && (
            <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-brand-ink">
              {log.next_adjustment}
            </p>
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
        </div>

        {/* 소유자: 수정 / 삭제 */}
        {data.is_owner && tea && (
          <div className="mt-3">
            <div className="flex items-center justify-end gap-1">
              <Link
                href={`/tea/${tea.id}/log?edit=${id}`}
                className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-semibold text-ink-muted transition-colors hover:bg-track hover:text-brand-ink"
              >
                <Pencil className="size-3.5" /> 수정
              </Link>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-semibold text-ink-muted transition-colors hover:bg-track hover:text-red-500"
              >
                <Trash2 className="size-3.5" /> 삭제
              </button>
            </div>
            {confirmDelete && (
              <div className="mt-2 rounded-[14px] border border-red-200 bg-red-50/60 p-3">
                <p className="text-[13px] font-bold text-red-600">
                  이 기록을 삭제할까요?
                </p>
                <p className="mt-1 text-[12px] text-red-500/90">
                  사진·좋아요·댓글이 함께 삭제되며 되돌릴 수 없어요.
                </p>
                <div className="mt-2.5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 rounded-pill border border-hairline bg-field py-2 text-[13px] font-bold text-brand-ink"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    disabled={delLog.isPending}
                    onClick={() =>
                      delLog.mutate(id, {
                        onSuccess: () => router.replace(`/tea/${tea.id}`),
                      })
                    }
                    className="flex-1 rounded-pill bg-red-500 py-2 text-[13px] font-bold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
                  >
                    {delLog.isPending ? "삭제 중…" : "삭제"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 기록 신고 (로그인 · 본인 글 아님) */}
        {data.is_authed && !data.is_owner && (
          <div className="mt-3 flex justify-end">
            <ReportButton targetType="log" targetId={id} label="이 기록 신고" />
          </div>
        )}

        {/* 댓글 */}
        <CommentsSection logId={id} />
      </main>
    </PhoneFrame>
  );
}
