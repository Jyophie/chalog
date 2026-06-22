"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type ProfileState = { error?: string; message?: string };

/** 닉네임(표시 이름) 수정 */
export async function updateProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "닉네임은 2자 이상이어야 해요." };
  if (name.length > 20) return { error: "닉네임은 20자 이하로 입력해주세요." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/my");

  const { error } = await supabase
    .from("users")
    .update({ display_name: name })
    .eq("id", user.id);
  if (error) return { error: "저장에 실패했어요. 다시 시도해주세요." };

  revalidatePath("/my");
  return { message: "닉네임을 저장했어요." };
}

/** 회원 탈퇴 — Storage 정리 후 auth 사용자 삭제(연쇄로 DB 전체 삭제) */
export async function deleteAccount(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 1) 내 차 이미지 폴더 비우기
  const { data: files } = await supabase.storage
    .from("tea-images")
    .list(user.id);
  if (files && files.length > 0) {
    await supabase.storage
      .from("tea-images")
      .remove(files.map((f) => `${user.id}/${f.name}`));
  }

  // 2) auth 사용자 삭제 (service role) → users/teas/guides/logs 연쇄 삭제
  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    // 실패 시 그대로 두고 마이페이지로
    redirect("/my?error=delete");
  }

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/?bye=1");
}
