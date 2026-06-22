"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { requestPasswordReset, type AuthState } from "@/app/login/actions";
import { PhoneFrame } from "@/components/layout/phone-frame";
import { TopBar } from "@/components/layout/top-bar";

const FIELD_CLASS =
  "h-[50px] w-full rounded-[16px] border border-hairline bg-field px-[17px] text-[14px] text-brand-ink outline-none transition-colors placeholder:text-[#1e2b2080] focus:border-brand";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    requestPasswordReset,
    {},
  );

  return (
    <PhoneFrame>
      <TopBar title="비밀번호 재설정" onBack={() => router.push("/login")} />

      <div className="flex flex-1 flex-col px-6 pt-4 pb-10">
        <h1 className="text-[22px] font-black text-brand-ink">
          비밀번호를 잊으셨나요?
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
          가입한 이메일을 입력하면 재설정 링크를 보내드려요.
        </p>

        <form action={formAction} className="mt-6 flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="mb-2.5 block text-[14px] font-bold text-brand-ink"
            >
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="tea@example.com"
              required
              className={FIELD_CLASS}
            />
          </div>

          {state.error && (
            <p className="text-[13px] text-red-500">{state.error}</p>
          )}
          {state.message && (
            <p className="rounded-[12px] bg-tint-green px-4 py-3 text-[13px] font-semibold text-mark">
              {state.message}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-1 w-full rounded-pill bg-brand py-4 text-[16px] font-bold text-white shadow-brand transition-colors hover:bg-brand-dark disabled:opacity-60"
          >
            {pending ? "보내는 중…" : "재설정 링크 보내기"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => router.push("/login")}
          className="mx-auto mt-5 text-[13px] font-semibold text-ink-muted underline underline-offset-2"
        >
          로그인으로 돌아가기
        </button>
      </div>
    </PhoneFrame>
  );
}
