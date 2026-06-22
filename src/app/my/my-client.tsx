"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  FileText,
  LogOut,
  Pencil,
  Shield,
} from "lucide-react";
import { signOut } from "@/app/login/actions";
import { updateProfile, deleteAccount, type ProfileState } from "./actions";
import { PhoneFrame } from "@/components/layout/phone-frame";
import { TopBar } from "@/components/layout/top-bar";

function fmtDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function MyClient({
  email,
  displayName,
  joinedAt,
  urlError,
}: {
  email: string;
  displayName: string;
  joinedAt: string | null;
  urlError?: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(
    async (prev, fd) => {
      const res = await updateProfile(prev, fd);
      if (res.message) setEditing(false);
      return res;
    },
    {},
  );

  const name = displayName || "차 애호가";
  const initial = (displayName || email || "?").trim().charAt(0).toUpperCase();

  return (
    <PhoneFrame>
      <TopBar title="내 정보" onBack={() => router.push("/archive")} />

      <main className="flex flex-1 flex-col px-6 pt-2 pb-10">
        {/* 프로필 카드 */}
        <div className="flex items-center gap-4 rounded-[20px] border border-hairline bg-field p-5 shadow-[0px_2px_6px_rgba(30,60,35,0.05)]">
          <span className="grid size-16 shrink-0 place-items-center rounded-full bg-brand text-[24px] font-black text-white">
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[18px] font-black text-brand-ink">
              {name}
            </p>
            <p className="truncate text-[13px] text-ink-muted">{email}</p>
            {joinedAt && (
              <p className="mt-0.5 text-[12px] text-ink-muted">
                {fmtDate(joinedAt)} 가입
              </p>
            )}
          </div>
          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label="닉네임 수정"
              className="grid size-9 shrink-0 place-items-center rounded-full bg-track text-brand-ink transition-colors hover:bg-[#e3ddd0]"
            >
              <Pencil className="size-4" />
            </button>
          )}
        </div>

        {/* 닉네임 수정 */}
        {editing && (
          <form action={formAction} className="mt-3 flex flex-col gap-2">
            <label className="text-[14px] font-bold text-brand-ink">닉네임</label>
            <input
              name="name"
              defaultValue={displayName}
              maxLength={20}
              autoFocus
              placeholder="아카이브에 표시될 이름"
              className="h-[50px] w-full rounded-[16px] border border-hairline bg-field px-[17px] text-[14px] text-brand-ink outline-none transition-colors placeholder:text-[#1e2b2080] focus:border-brand"
            />
            {state.error && (
              <p className="text-[13px] text-red-500">{state.error}</p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex-1 rounded-pill border border-hairline bg-field py-3 text-[14px] font-bold text-brand-ink"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={pending}
                className="flex-1 rounded-pill bg-brand py-3 text-[14px] font-bold text-white shadow-brand disabled:opacity-60"
              >
                {pending ? "저장 중…" : "저장"}
              </button>
            </div>
          </form>
        )}

        {!editing && state.message && (
          <p className="mt-2 text-[13px] font-semibold text-brand">
            {state.message}
          </p>
        )}

        {/* 약관 / 정책 */}
        <div className="mt-6 overflow-hidden rounded-[20px] border border-hairline bg-field shadow-[0px_2px_6px_rgba(30,60,35,0.05)]">
          <Link
            href="/terms"
            className="flex items-center gap-3 border-b border-hairline px-4 py-3.5 transition-colors hover:bg-tint-green/30"
          >
            <FileText className="size-[18px] text-brand" />
            <span className="flex-1 text-[14px] font-semibold text-brand-ink">
              이용약관
            </span>
            <ChevronRight className="size-4 text-ink-muted" />
          </Link>
          <Link
            href="/privacy"
            className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-tint-green/30"
          >
            <Shield className="size-[18px] text-brand" />
            <span className="flex-1 text-[14px] font-semibold text-brand-ink">
              개인정보처리방침
            </span>
            <ChevronRight className="size-4 text-ink-muted" />
          </Link>
        </div>

        {/* 로그아웃 */}
        <form action={signOut} className="mt-3">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-[20px] border border-hairline bg-field px-4 py-3.5 text-[14px] font-semibold text-brand-ink shadow-[0px_2px_6px_rgba(30,60,35,0.05)] transition-colors hover:bg-tint-green/30"
          >
            <LogOut className="size-[18px] text-brand" />
            로그아웃
          </button>
        </form>

        {urlError && (
          <p className="mt-4 text-[13px] text-red-500">{urlError}</p>
        )}

        {/* 회원 탈퇴 */}
        <div className="mt-8">
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="mx-auto block text-[13px] text-ink-muted underline underline-offset-2 transition-colors hover:text-red-500"
            >
              회원 탈퇴
            </button>
          ) : (
            <div className="rounded-[20px] border border-red-200 bg-red-50/60 p-4">
              <p className="text-[14px] font-bold text-red-600">
                정말 탈퇴하시겠어요?
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-red-500/90">
                저장한 모든 차와 마신 기록이 영구 삭제되며 되돌릴 수 없어요.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 rounded-pill border border-hairline bg-field py-3 text-[14px] font-bold text-brand-ink"
                >
                  취소
                </button>
                <form action={deleteAccount} className="flex-1">
                  <button
                    type="submit"
                    className="w-full rounded-pill bg-red-500 py-3 text-[14px] font-bold text-white transition-colors hover:bg-red-600"
                  >
                    탈퇴하기
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </PhoneFrame>
  );
}
