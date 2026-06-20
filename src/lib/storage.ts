import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";

const BUCKET = "tea-images";
const MAX_MB = 10;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export class UploadError extends Error {}

/** 차 이미지를 압축 후 Supabase Storage에 업로드하고 경로를 반환 */
export async function uploadTeaImage(file: File): Promise<string> {
  if (!ACCEPTED.includes(file.type)) {
    throw new UploadError("JPG, PNG, WebP 형식만 올릴 수 있어요.");
  }
  if (file.size > MAX_MB * 1024 * 1024) {
    throw new UploadError(`이미지는 ${MAX_MB}MB 이하만 가능해요.`);
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new UploadError("로그인이 필요해요.");

  // 클라이언트 압축 (최대 1600px, ~1MB 목표)
  const compressed = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: "image/webp",
  });

  const path = `${user.id}/${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, compressed, { contentType: "image/webp", upsert: false });
  if (error) throw new UploadError("업로드에 실패했어요. 다시 시도해주세요.");

  return path;
}

/** Storage 경로 → 표시용 signed URL */
export async function getSignedUrl(
  path: string,
  expiresIn = 3600,
): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn);
  return data?.signedUrl ?? null;
}
