"use client";

import { useActionState, useState } from "react";
import { updatePassword, type AuthState } from "@/app/login/actions";
import { PhoneFrame } from "@/components/layout/phone-frame";
import { TopBar } from "@/components/layout/top-bar";
import { cn } from "@/lib/utils";

const FIELD_CLASS =
  "h-[50px] w-full rounded-[16px] border border-hairline bg-field px-[17px] text-[14px] text-brand-ink outline-none transition-colors placeholder:text-[#1e2b2080] focus:border-brand";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    updatePassword,
    {},
  );

  const pwTooShort = password.length > 0 && password.length < 6;
  const mismatch = confirm.length > 0 && password !== confirm;
  const blockSubmit =
    pending || !password || !confirm || pwTooShort || mismatch;

  return (
    <PhoneFrame>
      <TopBar title="비밀번호 재설정" />

      <div className="flex flex-1 flex-col px-6 pt-4 pb-10">
        <h1 className="text-[22px] font-black text-brand-ink">
          새 비밀번호 설정
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
          새로 사용할 비밀번호를 입력해주세요.
        </p>

        <form action={formAction} className="mt-6 flex flex-col gap-4">
          <div>
            <label
              htmlFor="password"
              className="mb-2.5 block text-[14px] font-bold text-brand-ink"
            >
              새 비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="6자 이상 입력해주세요"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={FIELD_CLASS}
            />
            {pwTooShort && (
              <p className="mt-1.5 text-[12px] text-red-500">
                비밀번호는 6자 이상이어야 해요.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="passwordConfirm"
              className="mb-2.5 block text-[14px] font-bold text-brand-ink"
            >
              새 비밀번호 확인
            </label>
            <input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              autoComplete="new-password"
              placeholder="비밀번호를 한 번 더 입력해주세요"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={cn(
                FIELD_CLASS,
                mismatch && "border-red-400 focus:border-red-400",
              )}
            />
            {mismatch && (
              <p className="mt-1.5 text-[12px] text-red-500">
                비밀번호가 일치하지 않아요.
              </p>
            )}
          </div>

          {state.error && (
            <p className="text-[13px] text-red-500">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={blockSubmit}
            className="mt-1 w-full rounded-pill bg-brand py-4 text-[16px] font-bold text-white shadow-brand transition-colors hover:bg-brand-dark disabled:opacity-50"
          >
            {pending ? "변경 중…" : "비밀번호 변경하기"}
          </button>
        </form>
      </div>
    </PhoneFrame>
  );
}
