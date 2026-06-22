import { PhoneFrame } from "@/components/layout/phone-frame";
import { TopBar } from "@/components/layout/top-bar";

export const metadata = { title: "이용약관 · chalog" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="text-[15px] font-black text-brand-ink">{title}</h2>
      <div className="mt-1.5 space-y-1.5 text-[13px] leading-relaxed text-ink-muted">
        {children}
      </div>
    </section>
  );
}

/** 이용약관 (초안 — 정식 검토 필요) */
export default function TermsPage() {
  return (
    <PhoneFrame>
      <TopBar title="이용약관" />
      <main className="flex flex-1 flex-col px-6 pt-2 pb-12">
        <p className="rounded-[12px] bg-tint-cream px-4 py-3 text-[12px] text-[#8b6e52]">
          ⚠️ 본 약관은 초안입니다. 정식 서비스 전 법률 검토 후 확정해주세요.
        </p>

        <Section title="제1조 (목적)">
          <p>
            본 약관은 chalog(이하 &ldquo;서비스&rdquo;)가 제공하는 차 분석·기록
            서비스의 이용 조건 및 절차, 이용자와 서비스의 권리·의무를 규정합니다.
          </p>
          <p>
            본 서비스는 주소희가 운영하는 개인 프로젝트이며, 현재 무료로 제공됩니다.
          </p>
        </Section>
        <Section title="제2조 (서비스 내용)">
          <p>· 차 사진 업로드 및 AI 기반 정보 분석</p>
          <p>· 우림 가이드 생성 및 개인 아카이브·시음 기록 저장</p>
          <p>
            AI 분석 결과는 참고 정보이며 정확성을 보장하지 않습니다. 이용자는 결과를
            확인·보정할 수 있습니다.
          </p>
        </Section>
        <Section title="제3조 (계정)">
          <p>
            이용자는 이메일 또는 소셜 로그인으로 계정을 생성하며, 계정 정보 관리
            책임은 이용자에게 있습니다.
          </p>
        </Section>
        <Section title="제4조 (이용자의 의무)">
          <p>
            타인의 권리를 침해하거나 법령·공서양속에 반하는 콘텐츠를 업로드해서는 안
            됩니다.
          </p>
        </Section>
        <Section title="제5조 (콘텐츠 권리)">
          <p>
            이용자가 업로드한 사진·기록의 권리는 이용자에게 있으며, 서비스는 기능
            제공 목적 범위에서만 이를 이용합니다.
          </p>
        </Section>
        <Section title="제6조 (서비스 변경·중단)">
          <p>
            서비스는 운영상·기술상 필요에 따라 내용을 변경하거나 중단할 수 있습니다.
          </p>
        </Section>
        <Section title="제7조 (책임의 한계)">
          <p>
            서비스는 무료로 제공되며, AI 분석·가이드 정보로 인해 발생한 결과에 대해
            법령이 허용하는 범위에서 책임을 지지 않습니다.
          </p>
        </Section>
        <Section title="제8조 (운영자 및 문의)">
          <p>운영자: 주소희 (개인 프로젝트)</p>
          <p>문의: jyophie@gmail.com</p>
        </Section>

        <p className="mt-8 text-[12px] text-ink-muted">시행일: 2026-06-22 (초안)</p>
      </main>
    </PhoneFrame>
  );
}
