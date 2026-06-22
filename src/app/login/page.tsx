import Link from "next/link";
import { LoginForm } from "./login-form";
import { PhoneFrame } from "@/components/layout/phone-frame";

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
    <PhoneFrame>
      {/* TopBar (Figma 1:178) — 뒤로가기 */}
      <div className="flex items-center justify-between px-6 pt-14 pb-4">
        <Link
          href="/"
          aria-label="뒤로"
          className="grid size-10 place-items-center rounded-full bg-track text-brand-ink transition-colors hover:bg-[#e3ddd0]"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M19 12H5M11 18l-6-6 6-6" />
          </svg>
        </Link>
        <span className="size-10" />
      </div>

      <div className="flex flex-1 flex-col px-6 pt-2 pb-10">
        <LoginForm next={next} urlError={urlError} />
      </div>
    </PhoneFrame>
  );
}
