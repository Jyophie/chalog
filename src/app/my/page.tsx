import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MyClient } from "./my-client";

/** 내 정보 (프로필 · 로그아웃 · 탈퇴) */
export default async function MyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/my");

  const { data: profile } = await supabase
    .from("users")
    .select("display_name, created_at")
    .eq("id", user.id)
    .single();

  return (
    <MyClient
      email={user.email ?? ""}
      displayName={profile?.display_name ?? ""}
      joinedAt={profile?.created_at ?? null}
      urlError={sp.error === "delete" ? "탈퇴 처리에 실패했어요. 다시 시도해주세요." : undefined}
    />
  );
}
