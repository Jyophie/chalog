"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  Database,
  TeaCategory,
} from "@/lib/types/database";
import type { BrewingGuide, TeaLog } from "@/lib/schemas/tea";

export interface TeaListItem {
  id: string;
  tea_name: string | null;
  tea_category: TeaCategory | null;
  image_url: string | null; // signed
  is_favorite: boolean;
  created_at: string;
}

type TeaRow = Database["public"]["Tables"]["teas"]["Row"];
type GuideRow = Database["public"]["Tables"]["brewing_guides"]["Row"];
type LogRow = Database["public"]["Tables"]["tea_logs"]["Row"];

export interface TeaDetail {
  tea: TeaRow & { image_url: string | null; image_path: string | null };
  guide: GuideRow | null;
  logs: LogRow[];
  is_owner: boolean;
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? res.statusText);
  return res.json();
}

export function useTeas() {
  return useQuery({
    queryKey: ["teas"],
    queryFn: () => fetchJson<{ teas: TeaListItem[] }>("/api/teas").then((d) => d.teas),
  });
}

/* ── 커뮤니티: 공개 시음 기록 피드 + 좋아요/댓글 (기록 단위) ──── */

export interface FeedItem {
  id: string; // log id
  tea_name: string | null;
  tea_category: TeaCategory | null;
  author: string | null;
  author_id: string | null;
  author_avatar: string | null;
  brewed_at: string;
  images: string[];
  water_temperature: string | null;
  steeping_time: string | null;
  tea_amount: string | null;
  tool: string | null;
  taste_memo: string | null;
  aroma_memo: string | null;
  next_adjustment: string | null;
  rating: number | null;
  like_count: number;
  comment_count: number;
  liked_by_me: boolean;
  created_at: string;
}

export interface FeedResponse {
  items: FeedItem[];
  nextCursor: string | null;
  is_authed: boolean;
}

export function useFeed() {
  return useQuery({
    queryKey: ["feed"],
    queryFn: () => fetchJson<FeedResponse>("/api/feed"),
  });
}

export interface PublicLogTea {
  id: string;
  tea_name: string | null;
  tea_category: TeaCategory | null;
  brand: string | null;
  origin: string | null;
  production_year: string | null;
  image_url: string | null;
  user_id: string;
}

export interface PublicLogDetail {
  log: LogRow & { images: string[] };
  tea: PublicLogTea | null;
  author: string | null;
  author_avatar: string | null;
  liked_by_me: boolean;
  is_owner: boolean;
  is_authed: boolean;
}

export interface ProfileItem {
  id: string; // log id
  tea_name: string | null;
  tea_category: TeaCategory | null;
  cover: string | null;
  photo_count: number;
  rating: number | null;
  like_count: number;
  comment_count: number;
  created_at: string;
}

export interface UserProfile {
  author: string | null;
  avatar: string | null;
  items: ProfileItem[];
  count: number;
  is_me: boolean;
  is_authed: boolean;
}

export function useUserProfile(id: string) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => fetchJson<UserProfile>(`/api/u/${id}`),
    enabled: !!id,
  });
}

export function usePublicLog(id: string) {
  return useQuery({
    queryKey: ["public-log", id],
    queryFn: () => fetchJson<PublicLogDetail>(`/api/p/${id}`),
    enabled: !!id,
  });
}

/** 좋아요 토글 (낙관적 업데이트 — 피드 + 공개 기록 캐시 동시 갱신) */
export function useToggleLike(logId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (liked: boolean) =>
      fetchJson(`/api/logs/${logId}/like`, { method: liked ? "DELETE" : "POST" }),
    onMutate: async (liked) => {
      await qc.cancelQueries({ queryKey: ["public-log", logId] });
      await qc.cancelQueries({ queryKey: ["feed"] });
      const prevPublic = qc.getQueryData<PublicLogDetail>(["public-log", logId]);
      const prevFeed = qc.getQueryData<FeedResponse>(["feed"]);
      const delta = liked ? -1 : 1;
      if (prevPublic) {
        qc.setQueryData<PublicLogDetail>(["public-log", logId], {
          ...prevPublic,
          liked_by_me: !liked,
          log: {
            ...prevPublic.log,
            like_count: Math.max(0, prevPublic.log.like_count + delta),
          },
        });
      }
      if (prevFeed) {
        qc.setQueryData<FeedResponse>(["feed"], {
          ...prevFeed,
          items: prevFeed.items.map((it) =>
            it.id === logId
              ? {
                  ...it,
                  liked_by_me: !liked,
                  like_count: Math.max(0, it.like_count + delta),
                }
              : it,
          ),
        });
      }
      return { prevPublic, prevFeed };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prevPublic)
        qc.setQueryData(["public-log", logId], ctx.prevPublic);
      if (ctx?.prevFeed) qc.setQueryData(["feed"], ctx.prevFeed);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["public-log", logId] });
      qc.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

/** 기록 공개 여부 토글 (소유자, 차 상세에서 사용) */
export function useToggleLogPublic(teaId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ logId, isPublic }: { logId: string; isPublic: boolean }) =>
      fetchJson(`/api/logs/${logId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_public: isPublic }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tea", teaId] });
      qc.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export interface EditableLog {
  log: LogRow;
  photos: { path: string; url: string }[];
}

/** 편집용 기록 조회 (본인) */
export function useLogForEdit(logId: string) {
  return useQuery({
    queryKey: ["edit-log", logId],
    queryFn: () => fetchJson<EditableLog>(`/api/logs/${logId}`),
    enabled: !!logId,
    staleTime: 0,
  });
}

/** 기록 수정 (본인) */
export function useUpdateLog(teaId: string, logId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: object) =>
      fetchJson(`/api/logs/${logId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tea", teaId] });
      qc.invalidateQueries({ queryKey: ["public-log", logId] });
      qc.invalidateQueries({ queryKey: ["edit-log", logId] });
      qc.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

/** 기록 삭제 (본인) */
export function useDeleteLog(teaId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (logId: string) =>
      fetchJson(`/api/logs/${logId}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tea", teaId] });
      qc.invalidateQueries({ queryKey: ["feed"] });
      qc.invalidateQueries({ queryKey: ["teas"] });
    },
  });
}

export interface CommentItem {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  author: string | null;
  author_avatar: string | null;
}

export interface CommentsResponse {
  comments: CommentItem[];
  me: string | null;
  is_owner: boolean;
  is_authed: boolean;
}

export function useComments(logId: string) {
  return useQuery({
    queryKey: ["comments", logId],
    queryFn: () => fetchJson<CommentsResponse>(`/api/logs/${logId}/comments`),
    enabled: !!logId,
  });
}

export function useAddComment(logId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ body, parentId }: { body: string; parentId?: string }) =>
      fetchJson<{ id: string }>(`/api/logs/${logId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, parent_id: parentId }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", logId] });
      qc.invalidateQueries({ queryKey: ["public-log", logId] });
      qc.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function useDeleteComment(logId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) =>
      fetchJson(`/api/logs/${logId}/comments/${commentId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", logId] });
      qc.invalidateQueries({ queryKey: ["public-log", logId] });
      qc.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function useTea(id: string) {
  return useQuery({
    queryKey: ["tea", id],
    queryFn: () => fetchJson<TeaDetail>(`/api/teas/${id}`),
    enabled: !!id,
  });
}

export function useAddLog(teaId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (log: TeaLog) =>
      fetchJson<{ id: string }>(`/api/teas/${teaId}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(log),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tea", teaId] }),
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) =>
      fetchJson<{ id: string }>(`/api/teas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_favorite: value }),
      }),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["teas"] });
      qc.invalidateQueries({ queryKey: ["tea", v.id] });
    },
  });
}

/** 차 기본 정보 수정 */
export function useUpdateTea(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: object) =>
      fetchJson<{ id: string }>(`/api/teas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tea", id] });
      qc.invalidateQueries({ queryKey: ["teas"] });
    },
  });
}

/** 저장된 차 정보로 가이드 재생성 */
export function useRegenerateGuide(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      fetchJson(`/api/teas/${id}/guide`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tea", id] }),
  });
}

export function useDeleteTea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson<{ ok: boolean }>(`/api/teas/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teas"] }),
  });
}

/** 저장: 차 + 가이드 */
export function useSaveTea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      tea: Record<string, unknown>;
      guide: BrewingGuide;
      imagePath: string | null;
    }) =>
      fetchJson<{ id: string }>("/api/teas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teas"] }),
  });
}
