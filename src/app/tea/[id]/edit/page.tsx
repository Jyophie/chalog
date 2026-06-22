"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useTea,
  useUpdateTea,
  useRegenerateGuide,
} from "@/hooks/use-teas";
import { PhoneFrame } from "@/components/layout/phone-frame";
import { TopBar } from "@/components/layout/top-bar";
import { TeaInfoForm, type TeaInfoValues } from "@/components/tea-info-form";

/** 차 정보 수정 */
export default function EditTeaPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useTea(id);
  const update = useUpdateTea(id);
  const regen = useRegenerateGuide(id);
  const [error, setError] = useState<string | null>(null);

  const back = () => router.push(`/tea/${id}`);

  if (isLoading) {
    return (
      <PhoneFrame>
        <TopBar title="정보 수정" onBack={back} />
        <div className="px-6">
          <div className="h-40 w-full animate-pulse rounded-[20px] bg-tint-green/50" />
        </div>
      </PhoneFrame>
    );
  }
  if (isError || !data) {
    return (
      <PhoneFrame>
        <TopBar title="정보 수정" onBack={back} />
        <p className="mt-20 text-center text-[14px] text-red-500">
          차 정보를 불러오지 못했어요.
        </p>
      </PhoneFrame>
    );
  }

  const { tea } = data;
  const pending = update.isPending || regen.isPending;

  async function save(values: TeaInfoValues) {
    setError(null);
    try {
      await update.mutateAsync(values);
      back();
    } catch {
      setError("저장에 실패했어요. 다시 시도해주세요.");
    }
  }

  async function saveAndRegen(values: TeaInfoValues) {
    setError(null);
    try {
      await update.mutateAsync(values);
      await regen.mutateAsync();
      back();
    } catch {
      setError("가이드 재생성에 실패했어요. 정보는 저장됐을 수 있어요.");
    }
  }

  return (
    <PhoneFrame>
      <TopBar title="정보 수정" onBack={back} />

      <main className="flex flex-1 flex-col px-6 pt-2 pb-10">
        <p className="text-[14px] leading-[1.5] text-ink-muted">
          차 정보를 수정할 수 있어요. 종류·도구를 바꿨다면 가이드도 다시
          만들어보세요.
        </p>

        {error && <p className="mt-3 text-[13px] text-red-500">{error}</p>}

        <TeaInfoForm
          className="mt-5"
          initial={{
            tea_name: tea.tea_name ?? undefined,
            brand: tea.brand ?? undefined,
            origin: tea.origin ?? undefined,
            production_year: tea.production_year ?? undefined,
            tea_category: tea.tea_category ?? undefined,
            leaf_shape: tea.leaf_shape ?? undefined,
            brewing_tool: tea.brewing_tool ?? undefined,
            is_compressed: tea.is_compressed,
            drinking_style: tea.drinking_style ?? undefined,
            user_memo: tea.user_memo ?? undefined,
          }}
          pending={pending}
          submitLabel={
            update.isPending && !regen.isPending ? "저장 중…" : "저장하기"
          }
          onSubmit={save}
          secondaryLabel={
            regen.isPending ? "가이드 생성 중…" : "저장하고 가이드 다시 생성"
          }
          onSecondary={saveAndRegen}
        />
      </main>
    </PhoneFrame>
  );
}
