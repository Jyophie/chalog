"use client";

import { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Camera,
  Check,
  Coffee,
  ImageIcon,
  Leaf,
  Star,
  Thermometer,
  Timer,
  Upload,
  X,
} from "lucide-react";
import { useAddLog } from "@/hooks/use-teas";
import { teaLogSchema, BREWING_TOOLS } from "@/lib/schemas/tea";
import type { BrewingToolEnum } from "@/lib/types/database";
import { uploadTeaImage, UploadError } from "@/lib/storage";
import { PhoneFrame } from "@/components/layout/phone-frame";
import { TopBar } from "@/components/layout/top-bar";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/utils";

const TOOLS = BREWING_TOOLS.filter((t) => t !== "잘 모르겠음");

function FieldLabel({
  children,
  required,
  optional,
}: {
  children: React.ReactNode;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <p className="mb-2.5 text-[14px] font-bold text-brand-ink">
      {children}
      {required && <span className="ml-1 text-[11px] text-[#d4714a]">필수</span>}
      {optional && (
        <span className="ml-1 text-[14px] font-normal text-ink-muted">
          (선택)
        </span>
      )}
    </p>
  );
}

function Scale({
  value,
  onChange,
}: {
  value?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={cn(
            "h-9 flex-1 rounded-[24px] text-[14px] font-bold transition-colors",
            value === n ? "bg-brand text-white" : "bg-track text-ink-muted",
          )}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function ScaleLabels() {
  return (
    <div className="mt-1 flex justify-between text-[12px] text-ink-muted">
      <span>약함</span>
      <span>강함</span>
    </div>
  );
}

function StarRating({
  value,
  onChange,
}: {
  value?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-3">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n}점`}
          onClick={() => onChange(n)}
        >
          <Star
            className={cn(
              "size-8 transition-colors",
              n <= (value ?? 0)
                ? "fill-[#e8b84b] text-[#e8b84b]"
                : "text-[#e8b84b]/40",
            )}
          />
        </button>
      ))}
    </div>
  );
}

function ConditionField({
  icon,
  label,
  value,
  onChange,
  placeholder,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1 text-[12px] font-bold text-ink-muted">
        <span className="text-brand">{icon}</span>
        {label}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-[42px] w-full rounded-[24px] border border-hairline bg-field px-[15px] text-[14px] text-brand-ink outline-none transition-colors placeholder:text-[#1e2b2080] focus:border-brand"
      />
    </div>
  );
}

const TEXTAREA_CLASS =
  "w-full rounded-[16px] border border-hairline bg-field px-[17px] py-[13px] text-[14px] text-brand-ink outline-none transition-colors placeholder:text-[#1e2b2080] focus:border-brand";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** ⑩ 마신 기록 작성 */
export default function LogPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const addLog = useAddLog(id);

  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const [brewedAt, setBrewedAt] = useState(todayISO());
  const [photoPath, setPhotoPath] = useState<string>();
  const [photoPreview, setPhotoPreview] = useState<string>();
  const [uploading, setUploading] = useState(false);
  const [waterTemp, setWaterTemp] = useState("");
  const [steepTime, setSteepTime] = useState("");
  const [amount, setAmount] = useState("");
  const [tool, setTool] = useState<BrewingToolEnum>();
  const [taste, setTaste] = useState("");
  const [aroma, setAroma] = useState("");
  const [bitter, setBitter] = useState<number>();
  const [astringe, setAstringe] = useState<number>();
  const [rating, setRating] = useState<number>();
  const [adjust, setAdjust] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setPhotoPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const path = await uploadTeaImage(file);
      setPhotoPath(path);
    } catch (err) {
      setError(
        err instanceof UploadError ? err.message : "사진 업로드에 실패했어요.",
      );
      setPhotoPreview(undefined);
    } finally {
      setUploading(false);
    }
  }

  function removePhoto() {
    setPhotoPath(undefined);
    setPhotoPreview(undefined);
  }

  async function onSubmit() {
    setError(null);
    const payload = teaLogSchema.safeParse({
      brewed_at: brewedAt,
      photo_url: photoPath || undefined,
      water_temperature: waterTemp || undefined,
      steeping_time: steepTime || undefined,
      tea_amount: amount || undefined,
      tool,
      taste_memo: taste || undefined,
      aroma_memo: aroma || undefined,
      bitterness_level: bitter,
      astringency_level: astringe,
      rating,
      next_adjustment: adjust || undefined,
    });
    if (!payload.success) {
      setError("입력값을 확인해주세요.");
      return;
    }
    try {
      await addLog.mutateAsync(payload.data);
      router.replace(`/tea/${id}`);
    } catch {
      setError("저장에 실패했어요. 다시 시도해주세요.");
    }
  }

  const busy = addLog.isPending || uploading;

  return (
    <PhoneFrame>
      <TopBar
        title="기록 추가"
        onBack={() => router.push(`/tea/${id}`)}
        right={
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/decor/leaf.svg" alt="" aria-hidden className="size-5" />
        }
      />

      <main className="flex flex-1 flex-col px-6 pt-2 pb-10">
        {/* 안내 배너 */}
        <div className="rounded-[16px] bg-tint-green px-5 py-4 text-center">
          <p className="text-[14px] font-semibold text-mark">
            오늘의 차 경험을 기록해요 📚
          </p>
          <p className="text-[12px] text-ink-muted">
            쌓일수록 나만의 레시피가 돼요
          </p>
        </div>

        {/* 마신 날짜 */}
        <div className="mt-5">
          <FieldLabel required>마신 날짜 </FieldLabel>
          <Input
            type="date"
            value={brewedAt}
            onChange={(e) => setBrewedAt(e.target.value)}
          />
        </div>

        {/* 찻자리 사진 */}
        <div className="mt-5">
          <FieldLabel optional>찻자리 사진 </FieldLabel>
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={onPickPhoto}
          />
          <input
            ref={galleryRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={onPickPhoto}
          />

          {photoPreview ? (
            <div className="relative overflow-hidden rounded-[16px] border border-hairline">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoPreview}
                alt="찻자리 사진"
                className="aspect-video w-full object-cover"
              />
              {uploading && (
                <div className="absolute inset-0 grid place-items-center bg-black/30 text-[13px] font-semibold text-white">
                  올리는 중…
                </div>
              )}
              <button
                type="button"
                onClick={removePhoto}
                aria-label="사진 삭제"
                className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => cameraRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 rounded-[16px] border-[1.5px] border-dashed border-hairline bg-field py-6 text-[12px] font-semibold text-brand-ink transition-colors hover:bg-tint-green/30"
              >
                <Camera className="size-[22px] text-brand" /> 카메라로 찍기
              </button>
              <button
                type="button"
                onClick={() => galleryRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 rounded-[16px] border-[1.5px] border-dashed border-hairline bg-field py-6 text-[12px] font-semibold text-brand-ink transition-colors hover:bg-tint-green/30"
              >
                <Upload className="size-[22px] text-brand" /> 갤러리에서 선택
              </button>
            </div>
          )}
        </div>

        {/* 브루잉 조건 */}
        <div className="mt-5">
          <FieldLabel>브루잉 조건</FieldLabel>
          <div className="grid grid-cols-2 gap-3">
            <ConditionField
              icon={<Thermometer className="size-3.5" />}
              label="물 온도 (°C)"
              value={waterTemp}
              onChange={setWaterTemp}
              placeholder="예: 88"
            />
            <ConditionField
              icon={<Timer className="size-3.5" />}
              label="우리는 시간"
              value={steepTime}
              onChange={setSteepTime}
              placeholder="예: 25초"
            />
            <ConditionField
              icon={<Leaf className="size-3.5" />}
              label="차 양"
              value={amount}
              onChange={setAmount}
              placeholder="예: 4g"
            />
          </div>

          <div className="mt-4 flex items-center gap-1 text-[12px] font-bold text-ink-muted">
            <Coffee className="size-3.5 text-brand" /> 사용 도구
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {TOOLS.map((t) => (
              <Chip key={t} selected={tool === t} onClick={() => setTool(t)}>
                {t}
              </Chip>
            ))}
          </div>
        </div>

        {/* 맛 / 향 메모 */}
        <div className="mt-5">
          <FieldLabel>맛 메모</FieldLabel>
          <textarea
            rows={2}
            value={taste}
            onChange={(e) => setTaste(e.target.value)}
            placeholder="어떤 맛이었나요? 예: 꽃향, 달콤함, 약간 떫음..."
            className={TEXTAREA_CLASS}
          />
        </div>
        <div className="mt-4">
          <FieldLabel>향 메모</FieldLabel>
          <textarea
            rows={2}
            value={aroma}
            onChange={(e) => setAroma(e.target.value)}
            placeholder="어떤 향이었나요? 예: 꽃향, 흙냄새, 과일향..."
            className={TEXTAREA_CLASS}
          />
        </div>

        {/* 쓴맛 / 떫은맛 */}
        <div className="mt-5">
          <FieldLabel>쓴맛 정도</FieldLabel>
          <Scale value={bitter} onChange={setBitter} />
          <ScaleLabels />
        </div>
        <div className="mt-4">
          <FieldLabel>떫은맛 정도</FieldLabel>
          <Scale value={astringe} onChange={setAstringe} />
          <ScaleLabels />
        </div>

        {/* 만족도 */}
        <div className="mt-5">
          <FieldLabel>만족도</FieldLabel>
          <StarRating value={rating} onChange={setRating} />
          <p className="mt-1.5 text-[12px] text-ink-muted">
            별을 눌러 평가해보세요
          </p>
        </div>

        {/* 다음에 조정할 점 */}
        <div className="mt-5">
          <FieldLabel optional>다음에 조정할 점 </FieldLabel>
          <Input
            value={adjust}
            onChange={(e) => setAdjust(e.target.value)}
            placeholder="예: 온도 낮추기, 시간 10초 줄이기"
          />
        </div>

        {error && <p className="mt-4 text-[13px] text-red-500">{error}</p>}

        {/* 저장 */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={busy}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-pill bg-brand px-6 py-4 text-[16px] font-bold text-white shadow-brand transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {addLog.isPending ? "저장 중…" : "기록 저장하기"}
          {!addLog.isPending && <Check className="size-[18px]" />}
        </button>
      </main>
    </PhoneFrame>
  );
}
