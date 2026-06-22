"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useScanFlow } from "@/store/scan-flow";
import { PhoneFrame } from "@/components/layout/phone-frame";
import { TopBar } from "@/components/layout/top-bar";
import { TeaInfoForm } from "@/components/tea-info-form";

/** ⑥ 정보 확인 · 수정 */
export default function CorrectionPage() {
  const router = useRouter();
  const { analysisResult, setCorrectionForm } = useScanFlow();

  useEffect(() => {
    if (!analysisResult) router.replace("/upload");
  }, [analysisResult, router]);

  if (!analysisResult) return null;
  const r = analysisResult;

  return (
    <PhoneFrame>
      <TopBar title="정보 확인 · 수정" onBack={() => router.push("/result")} />

      <main className="flex flex-1 flex-col px-6 pt-2 pb-10">
        <p className="text-[14px] leading-[1.5] text-ink-muted">
          AI 분석 결과를 바탕으로 미리 채웠어요. 틀린 곳이 있으면 수정해주세요!
        </p>

        <TeaInfoForm
          className="mt-5"
          initial={{
            tea_name: r.tea_name ?? undefined,
            brand: r.brand ?? undefined,
            origin: r.origin ?? undefined,
            production_year: r.production_year ?? undefined,
            tea_category: r.tea_category ?? undefined,
            is_compressed: false,
          }}
          submitLabel="우리는 가이드 생성하기"
          onSubmit={(values) => {
            setCorrectionForm(values);
            router.push("/guide");
          }}
        />
      </main>
    </PhoneFrame>
  );
}
