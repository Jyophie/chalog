"use client";

import { useActionState, useState } from "react";
import { signIn, signUp, signInWithGoogle, type AuthState } from "./actions";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Mode = "login" | "signup";

export function LoginForm({
  next,
  urlError,
}: {
  next: string;
  urlError?: string;
}) {
  const [mode, setMode] = useState<Mode>("login");
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    mode === "login" ? signIn : signUp,
    {},
  );

  return (
    <div className="flex flex-col items-center gap-7">
      {/* 헤더 */}
      <div className="flex flex-col items-center gap-3 text-center">
        <Logo size="md" />
        <div className="mt-2">
          <h1 className="font-display text-2xl font-black text-brand-ink">
            반가워요!
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            차 한 잔의 여정을 함께 기록해요
          </p>
        </div>
      </div>

      {/* 로그인 / 회원가입 탭 */}
      <div className="flex w-full gap-2 rounded-[16px] bg-tint-green p-1">
        {(["login", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              "h-10 flex-1 rounded-[12px] text-sm font-bold transition-colors",
              mode === m
                ? "bg-surface text-brand shadow-sm"
                : "text-ink-muted",
            )}
          >
            {m === "login" ? "로그인" : "회원가입"}
          </button>
        ))}
      </div>

      {/* 폼 */}
      <form action={formAction} className="flex w-full flex-col gap-4">
        <input type="hidden" name="next" value={next} />
        <div>
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tea@example.com"
            required
          />
        </div>
        <div>
          <Label htmlFor="password">비밀번호</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder="••••••••"
            required
          />
        </div>

        {(state.error || urlError) && (
          <p className="text-sm text-red-500">{state.error ?? urlError}</p>
        )}
        {state.message && (
          <p className="rounded-[12px] bg-tint-cream px-4 py-3 text-sm text-brand-ink">
            {state.message}
          </p>
        )}

        <Button type="submit" size="lg" block disabled={pending} className="mt-1">
          {pending
            ? "처리 중…"
            : mode === "login"
              ? "로그인"
              : "회원가입"}
        </Button>
      </form>

      {/* 구분선 */}
      <div className="flex w-full items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-ink-muted">또는</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* 소셜 로그인 */}
      <div className="flex w-full flex-col gap-2.5">
        <form action={signInWithGoogle}>
          <input type="hidden" name="next" value={next} />
          <Button type="submit" variant="outline" size="md" block>
            Google로 계속하기
          </Button>
        </form>
        <Button
          type="button"
          variant="outline"
          size="md"
          block
          disabled
          title="준비 중"
        >
          카카오로 계속하기 (준비 중)
        </Button>
      </div>
    </div>
  );
}
