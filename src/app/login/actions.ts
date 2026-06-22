"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string };

function safeNext(next: FormDataEntryValue | null): string {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") ? n : "/feed";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!email || !password) return { error: "이메일과 비밀번호를 입력해주세요." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "이메일 또는 비밀번호를 확인해주세요." };

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");
  const next = safeNext(formData.get("next"));

  if (!name || !email || !password)
    return { error: "닉네임, 이메일, 비밀번호를 모두 입력해주세요." };
  if (name.length < 2) return { error: "닉네임은 2자 이상이어야 해요." };
  if (!EMAIL_RE.test(email)) return { error: "이메일 형식을 확인해주세요." };
  if (password.length < 6) return { error: "비밀번호는 6자 이상이어야 해요." };
  if (password !== passwordConfirm)
    return { error: "비밀번호가 일치하지 않아요." };

  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }, // → handle_new_user 트리거가 users.display_name 으로 저장
      emailRedirectTo: `${origin}/auth/callback?next=${next}`,
    },
  });
  if (error) return { error: error.message };

  // 이메일 확인이 꺼져 있으면 바로 세션 발급 → 진입
  if (data.session) {
    revalidatePath("/", "layout");
    redirect(next);
  }
  return { message: "확인 메일을 보냈어요. 메일함에서 인증을 완료해주세요." };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

/** 비밀번호 재설정 메일 요청 */
export async function requestPasswordReset(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!EMAIL_RE.test(email)) return { error: "이메일 형식을 확인해주세요." };

  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });
  // 보안상 가입 여부와 무관하게 동일 응답
  if (error) return { error: "메일 발송에 실패했어요. 잠시 후 다시 시도해주세요." };
  return {
    message: "재설정 링크를 메일로 보냈어요. 메일함(스팸함 포함)을 확인해주세요.",
  };
}

/** 새 비밀번호 설정 (재설정 링크로 진입한 세션에서) */
export async function updatePassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("passwordConfirm") ?? "");
  if (password.length < 6) return { error: "비밀번호는 6자 이상이어야 해요." };
  if (password !== confirm) return { error: "비밀번호가 일치하지 않아요." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return {
      error: "링크가 만료됐어요. 재설정 메일을 다시 요청해주세요.",
    };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "변경에 실패했어요. 다시 시도해주세요." };

  revalidatePath("/", "layout");
  redirect("/feed");
}

export async function signInWithGoogle(formData: FormData): Promise<void> {
  const next = safeNext(formData.get("next"));
  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback?next=${next}` },
  });
  if (error || !data.url) redirect("/login?error=google");
  redirect(data.url);
}
