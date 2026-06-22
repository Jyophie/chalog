"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Heart, Images, MessageCircle } from "lucide-react";
import { useUserProfile } from "@/hooks/use-teas";
import { PhoneFrame } from "@/components/layout/phone-frame";
import { TopBar } from "@/components/layout/top-bar";
import { Avatar } from "@/components/ui/avatar";

/** 작성자 공개 프로필 (id = user id, 읽기 전용·비로그인 포함) */
export default function UserProfilePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useUserProfile(id);

  const name = data?.author || "차 애호가";

  return (
    <PhoneFrame>
      <TopBar title="프로필" onBack={() => router.back()} />

      <main className="flex flex-1 flex-col px-6 pt-2 pb-10">
        {/* 프로필 헤더 */}
        <div className="flex items-center gap-4">
          <Avatar
            src={data?.avatar}
            name={name}
            className="size-16"
            fontClassName="text-[24px]"
          />
          <div className="min-w-0">
            <h1 className="truncate text-[20px] font-black text-brand-ink">
              {name}
              {data?.is_me && (
                <span className="ml-2 align-middle text-[12px] font-semibold text-ink-muted">
                  나
                </span>
              )}
            </h1>
            <p className="mt-0.5 text-[13px] text-ink-muted">
              공개 기록 {data?.count ?? 0}개
            </p>
          </div>
        </div>

        {/* 기록 그리드 */}
        <div className="mt-6">
          {isLoading && (
            <div className="grid grid-cols-3 gap-1.5">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="aspect-square animate-pulse rounded-[10px] bg-tint-green/50"
                />
              ))}
            </div>
          )}

          {isError && (
            <p className="mt-10 text-center text-[14px] text-red-500">
              프로필을 불러오지 못했어요.
            </p>
          )}

          {data && data.items.length === 0 && (
            <div className="mt-16 flex flex-col items-center gap-3 text-center">
              <span className="text-5xl">🍵</span>
              <p className="text-[14px] text-ink-muted">
                아직 공개된 기록이 없어요.
              </p>
            </div>
          )}

          {data && data.items.length > 0 && (
            <div className="grid grid-cols-3 gap-1.5">
              {data.items.map((item) => (
                <Link
                  key={item.id}
                  href={`/p/${item.id}`}
                  className="relative aspect-square overflow-hidden rounded-[10px] bg-tint-green"
                >
                  {item.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.cover}
                      alt={item.tea_name ?? ""}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="grid size-full place-items-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/decor/teacup.svg"
                        alt=""
                        aria-hidden
                        className="size-7 opacity-60"
                      />
                    </div>
                  )}

                  {item.photo_count > 1 && (
                    <Images className="absolute right-1.5 top-1.5 size-3.5 text-white drop-shadow" />
                  )}

                  {/* 좋아요/댓글 (사진 있을 때만 오버레이) */}
                  {(item.like_count > 0 || item.comment_count > 0) && (
                    <div className="absolute inset-x-0 bottom-0 flex items-center gap-2.5 bg-gradient-to-t from-black/45 to-transparent px-2 pb-1 pt-5 text-[10px] font-bold text-white">
                      {item.like_count > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Heart className="size-2.5" /> {item.like_count}
                        </span>
                      )}
                      {item.comment_count > 0 && (
                        <span className="flex items-center gap-0.5">
                          <MessageCircle className="size-2.5" />{" "}
                          {item.comment_count}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </PhoneFrame>
  );
}
