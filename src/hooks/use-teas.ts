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
