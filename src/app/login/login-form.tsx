"use client";

import { useActionState, useState } from "react";
import { signIn, signUp, signInWithGoogle, type AuthState } from "./actions";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

type Mode = "login" | "signup";

const FIELD_CLASS =
  "h-[50px] w-full rounded-[16px] border border-hairline bg-field px-[17px] text-[14px] text-brand-ink outline-none transition-colors placeholder:text-[#1e2b2080] focus:border-brand";

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2.5 block text-[14px] font-bold text-brand-ink"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export function LoginForm({
  next,
  urlError,
}: {
  next: string;
  urlError?: string;
}) {
  const [mode, setMode] = useState<Mode>("login");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    mode === "login" ? signIn : signUp,
    {},
  );

  const isSignup = mode === "signup";
  const pwTooShort = isSignup && password.length > 0 && password.length < 6;
  const mismatch = isSignup && confirm.length > 0 && password !== confirm;
  const blockSubmit =
    pending || (isSignup && (pwTooShort || mismatch || !password || !confirm));

  return (
    <div className="flex flex-col">
      {/* 헤더 (Figma 1:186) */}
      <div className="flex flex-col items-center">
        <Logo size="lg" className="mb-5" />
        <div className="rounded-[16px] bg-tint-green px-5 py-2.5">
          <p className="text-center text-[12px] font-semibold text-mark">
            차 사진으로 시작하는 나만의 티 아카이브
          </p>
        </div>
        <h1 className="mt-4 text-[24px] font-black leading-8 text-brand-ink">
          반가워요!
        </h1>
        <p className="mt-1 text-[14px] text-ink-muted">
          {isSignup
            ? "차 한 잔의 여정을 함께 시작해요"
            : "차 한 잔의 여정을 함께 기록해요"}
        </p>
      </div>

      {/* 로그인 / 회원가입 탭 (Figma 1:210) */}
      <div className="mt-7 flex gap-1 rounded-[16px] bg-track p-1">
        {(["login", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              "flex-1 rounded-[24px] py-2.5 text-[14px] font-bold transition-colors",
              mode === m
                ? "bg-field text-brand-ink shadow-[0px_2px_4px_rgba(0,0,0,0.07)]"
                : "text-ink-muted",
            )}
          >
            {m === "login" ? "로그인" : "회원가입"}
          </button>
        ))}
      </div>

      {/* 폼 (Figma 1:216) */}
      <form action={formAction} className="mt-5 flex flex-col gap-4">
        <input type="hidden" name="next" value={next} />

        {isSignup && (
          <Field id="name" label="닉네임">
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="nickname"
              maxLength={20}
              placeholder="아카이브에 표시될 이름"
              required
              className={FIELD_CLASS}
            />
          </Field>
        )}

        <Field id="email" label="이메일">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tea@example.com"
            required
            className={FIELD_CLASS}
          />
        </Field>

        <Field id="password" label="비밀번호">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            placeholder={isSignup ? "6자 이상 입력해주세요" : "••••••••"}
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
        </Field>

        {isSignup && (
          <Field id="passwordConfirm" label="비밀번호 확인">
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
          </Field>
        )}

        {(state.error || urlError) && (
          <p className="text-[13px] text-red-500">{state.error ?? urlError}</p>
        )}
        {state.message && (
          <p className="rounded-[12px] bg-tint-cream px-4 py-3 text-[13px] text-brand-ink">
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={blockSubmit}
          className="mt-1 w-full rounded-pill bg-brand py-4 text-[16px] font-bold text-white shadow-brand transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? "처리 중…" : isSignup ? "회원가입" : "로그인"}
        </button>
      </form>

      {/* 구분선 (Figma 1:232) */}
      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-hairline" />
        <span className="text-[12px] text-ink-muted">또는</span>
        <div className="h-px flex-1 bg-hairline" />
      </div>

      {/* 소셜 로그인 (Figma 1:237) */}
      <form action={signInWithGoogle}>
        <input type="hidden" name="next" value={next} />
        <button
          type="submit"
          className="w-full rounded-pill border border-hairline bg-field py-[15px] text-[14px] font-bold text-brand-ink transition-colors hover:bg-[#f1ece0]"
        >
          Google로 계속하기
        </button>
      </form>

      {isSignup && (
        <p className="mt-4 text-center text-[11px] leading-relaxed text-ink-muted">
          가입하면{" "}
          <a href="/terms" className="underline underline-offset-2">
            이용약관
          </a>
          과{" "}
          <a href="/privacy" className="underline underline-offset-2">
            개인정보처리방침
          </a>
          에 동의하는 것으로 간주됩니다.
        </p>
      )}
    </div>
  );
}
