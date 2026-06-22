"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string };

function safeNext(next: FormDataEntryValue | null): string {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") ? n : "/upload";
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
