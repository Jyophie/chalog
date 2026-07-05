import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { PublicLogClient } from "./public-log-client";

/** 공유 카드용 메타데이터 (공개 기록만) */
async function getMeta(id: string) {
  const admin = createAdminClient();
  const { data: log } = await admin
    .from("tea_logs")
    .select("photo_url, photo_paths, taste_memo, next_adjustment, tea_id")
    .eq("id", id)
    .eq("is_public", true)
    .maybeSingle();
  if (!log) return null;

  const { data: tea } = await admin
    .from("teas")
    .select("tea_name, tea_category, image_url, user_id")
    .eq("id", log.tea_id)
    .maybeSingle();
  const { data: profile } = tea
    ? await admin
        .from("public_profiles")
        .select("display_name")
        .eq("id", tea.user_id)
        .maybeSingle()
    : { data: null };

  const coverPath =
    log.photo_paths?.[0] ?? log.photo_url ?? tea?.image_url ?? null;
  let image: string | null = null;
  if (coverPath) {
    const { data } = await admin.storage
      .from("tea-images")
      .createSignedUrl(coverPath, 3600);
    image = data?.signedUrl ?? null;
  }

  return {
    teaName: tea?.tea_name ?? null,
    category: tea?.tea_category ?? null,
    author: profile?.display_name ?? null,
    desc: log.next_adjustment || log.taste_memo || "",
    image,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const meta = await getMeta(id);
  if (!meta) {
    return { title: "chalog", description: "차 한 잔의 기록" };
  }

  const title = `${meta.teaName ?? "차 기록"} · chalog`;
  const description =
    meta.desc.slice(0, 120) ||
    `${meta.author ?? "차 애호가"}님의 ${meta.category ?? "차"} 기록`;
  const images = meta.image ? [{ url: meta.image }] : [];

  return {
    title,
    description,
    openGraph: { title, description, images, type: "article" },
    twitter: {
      card: images.length ? "summary_large_image" : "summary",
      title,
      description,
      images,
    },
  };
}

export default function PublicLogPage() {
  return <PublicLogClient />;
}
