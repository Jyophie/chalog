"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Camera,
  Check,
  Coffee,
  ImageIcon,
  Leaf,
  Plus,
  Star,
  Thermometer,
  Timer,
  Upload,
  X,
} from "lucide-react";
import { useAddLog, useLogForEdit, useUpdateLog } from "@/hooks/use-teas";
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
  const editId = useSearchParams().get("edit");
  const isEdit = !!editId;
  const addLog = useAddLog(id);
  const updateLog = useUpdateLog(id, editId ?? "");
  const editData = useLogForEdit(editId ?? "");

  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const prefilled = useRef(false);

  const [brewedAt, setBrewedAt] = useState(todayISO());
  const [photos, setPhotos] = useState<{ path: string; preview: string }[]>([]);
  const [uploadingCount, setUploadingCount] = useState(0);
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
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_PHOTOS = 10;

  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setError(null);
    const take = files.slice(0, MAX_PHOTOS - photos.length);
    setUploadingCount((c) => c + take.length);
    await Promise.all(
      take.map(async (file) => {
        const preview = URL.createObjectURL(file);
        try {
          const path = await uploadTeaImage(file);
          setPhotos((prev) => [...prev, { path, preview }]);
        } catch (err) {
          setError(
            err instanceof UploadError
              ? err.message
              : "사진 업로드에 실패했어요.",
          );
          URL.revokeObjectURL(preview);
        } finally {
          setUploadingCount((c) => c - 1);
        }
      }),
    );
  }

  function removePhoto(idx: number) {
    setPhotos((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[idx].preview);
      next.splice(idx, 1);
      return next;
    });
  }

  const uploading = uploadingCount > 0;

  // 편집 모드: 기존 값으로 1회 프리필
  useEffect(() => {
    const d = editData.data;
    if (!isEdit || !d || prefilled.current) return;
    prefilled.current = true;
    const l = d.log;
    setBrewedAt(l.brewed_at);
    setPhotos(d.photos.map((p) => ({ path: p.path, preview: p.url })));
    setWaterTemp(l.water_temperature ?? "");
    setSteepTime(l.steeping_time ?? "");
    setAmount(l.tea_amount ?? "");
    setTool((l.tool as BrewingToolEnum | null) ?? undefined);
    setTaste(l.taste_memo ?? "");
    setAroma(l.aroma_memo ?? "");
    setBitter(l.bitterness_level ?? undefined);
    setAstringe(l.astringency_level ?? undefined);
    setRating(l.rating ?? undefined);
    setAdjust(l.next_adjustment ?? "");
    setIsPublic(l.is_public);
  }, [isEdit, editData.data]);

  async function onSubmit() {
    setError(null);
    if (photos.length === 0) {
      setError("사진을 최소 한 장 이상 첨부해주세요.");
      return;
    }
    const payload = teaLogSchema.safeParse({
      brewed_at: brewedAt,
      photo_paths: photos.map((p) => p.path),
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
      is_public: isPublic,
    });
    if (!payload.success) {
      setError("입력값을 확인해주세요.");
      return;
    }
    try {
      if (isEdit) {
        await updateLog.mutateAsync(payload.data);
      } else {
        await addLog.mutateAsync(payload.data);
      }
      router.replace(`/tea/${id}`);
    } catch {
      setError("저장에 실패했어요. 다시 시도해주세요.");
    }
  }

  const saving = addLog.isPending || updateLog.isPending;
  const busy = saving || uploading;

  return (
    <PhoneFrame>
      <TopBar
        title={isEdit ? "기록 수정" : "기록 추가"}
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

        {/* 찻자리 사진 (필수, 여러 장) */}
        <div className="mt-5">
          <FieldLabel required>찻자리 사진 </FieldLabel>
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
            multiple
            className="hidden"
            onChange={onPickPhoto}
          />

          {photos.length === 0 ? (
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
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {photos.map((p, i) => (
                <div
                  key={p.path}
                  className="relative aspect-square overflow-hidden rounded-[14px] border border-hairline"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.preview}
                    alt=""
                    className="size-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    aria-label="사진 삭제"
                    className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/45 text-white"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <button
                  type="button"
                  onClick={() => galleryRef.current?.click()}
                  aria-label="사진 추가"
                  className="grid aspect-square place-items-center rounded-[14px] border-[1.5px] border-dashed border-hairline bg-field text-brand transition-colors hover:bg-tint-green/30"
                >
                  <Plus className="size-6" />
                </button>
              )}
            </div>
          )}
          {uploading && (
            <p className="mt-2 text-[12px] text-ink-muted">사진 올리는 중…</p>
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

        {/* 노트 */}
        <div className="mt-5">
          <FieldLabel optional>노트 </FieldLabel>
          <textarea
            value={adjust}
            onChange={(e) => setAdjust(e.target.value)}
            rows={3}
            placeholder="이 차에 대한 한마디 — 어땠는지, 다음엔 어떻게 우릴지 적어보세요"
            className="w-full rounded-[16px] border border-hairline bg-field px-[17px] py-[13px] text-[14px] text-brand-ink outline-none transition-colors placeholder:text-[#1e2b2080] focus:border-brand"
          />
        </div>

        {/* 피드 공개 */}
        <div className="mt-6 rounded-[16px] border border-hairline bg-field p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[14px] font-bold text-brand-ink">
                피드에 공개
              </p>
              <p className="mt-0.5 text-[12px] text-ink-muted">
                이 기록을 다른 사람들과 나눠요
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isPublic}
              aria-label="피드 공개"
              onClick={() => setIsPublic((v) => !v)}
              className={cn(
                "relative h-7 w-12 shrink-0 rounded-full transition-colors",
                isPublic ? "bg-brand" : "bg-track",
              )}
            >
              <span
                className={cn(
                  "absolute top-1 size-5 rounded-full bg-white shadow transition-all",
                  isPublic ? "left-6" : "left-1",
                )}
              />
            </button>
          </div>
          {isPublic && (
            <p className="mt-2.5 rounded-[10px] bg-tint-cream/70 px-3 py-2 text-[11px] leading-relaxed text-[#8b6e52]">
              공개하면 사진·맛/향 메모·평점이 피드에 노출돼요. 개인정보가 없는지
              확인해주세요.
            </p>
          )}
        </div>

        {error && <p className="mt-4 text-[13px] text-red-500">{error}</p>}

        {/* 저장 */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={busy}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-pill bg-brand px-6 py-4 text-[16px] font-bold text-white shadow-brand transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {saving
            ? "저장 중…"
            : uploading
              ? "사진 올리는 중…"
              : isEdit
                ? "수정 완료"
                : "기록 저장하기"}
          {!busy && <Check className="size-[18px]" />}
        </button>
      </main>
    </PhoneFrame>
  );
}
