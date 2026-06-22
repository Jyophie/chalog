import { cn } from "@/lib/utils";

/**
 * 프로필 아바타 — 사진(src)이 있으면 사진, 없으면 닉네임 첫 글자.
 * className으로 크기/모양을 지정 (예: "size-9"), fontClassName으로 글자 크기.
 */
export function Avatar({
  src,
  name,
  className,
  fontClassName = "text-[14px]",
}: {
  src?: string | null;
  name?: string | null;
  className?: string;
  fontClassName?: string;
}) {
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-brand",
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <span className={cn("font-black text-white", fontClassName)}>
          {initial}
        </span>
      )}
    </span>
  );
}
