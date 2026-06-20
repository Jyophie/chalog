import { LoginForm } from "./login-form";

const URL_ERRORS: Record<string, string> = {
  auth: "로그인에 실패했어요. 다시 시도해주세요.",
  google: "Google 로그인을 사용할 수 없어요.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next?.startsWith("/") ? sp.next : "/upload";
  const urlError = sp.error ? URL_ERRORS[sp.error] : undefined;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col justify-center px-6 py-10">
      <LoginForm next={next} urlError={urlError} />
    </main>
  );
}
