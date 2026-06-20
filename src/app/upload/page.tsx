import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

/**
 * ③ 업로드 화면 — placeholder.
 * 지금은 인증 흐름 검증용. 실제 업로드 UI는 다음 단계에서 구현.
 */
export default async function UploadPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // proxy가 1차 가드하지만, 서버에서 한 번 더 방어
  if (!user) redirect("/login?next=/upload");

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo size="md" />
      <div>
        <h1 className="font-display text-xl font-black text-brand-ink">
          로그인 성공 🎉
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          {user.email}
        </p>
        <p className="mt-1 text-xs text-ink-muted">
          ③ 차 사진 업로드 화면은 다음 단계에서 구현됩니다.
        </p>
      </div>
      <form action={signOut}>
        <Button type="submit" variant="outline" size="md">
          로그아웃
        </Button>
      </form>
    </main>
  );
}
