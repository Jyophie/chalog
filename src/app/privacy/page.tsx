import { PhoneFrame } from "@/components/layout/phone-frame";
import { TopBar } from "@/components/layout/top-bar";

export const metadata = { title: "개인정보처리방침 · chalog" };

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

/** 개인정보처리방침 (초안 — 정식 검토 필요) */
export default function PrivacyPage() {
  return (
    <PhoneFrame>
      <TopBar title="개인정보처리방침" />
      <main className="flex flex-1 flex-col px-6 pt-2 pb-12">
        <p className="rounded-[12px] bg-tint-cream px-4 py-3 text-[12px] text-[#8b6e52]">
          ⚠️ 본 방침은 초안입니다. 정식 서비스 전 법률 검토 후 확정해주세요.
        </p>

        <Section title="1. 수집하는 개인정보 항목">
          <p>· 필수: 이메일, 닉네임, 비밀번호(이메일 가입 시)</p>
          <p>· 소셜 로그인 시: 이메일, 프로필 이름</p>
          <p>· 이용 과정에서 생성: 업로드한 차 사진, 시음 기록</p>
        </Section>
        <Section title="2. 수집·이용 목적">
          <p>· 회원 식별 및 로그인</p>
          <p>· 차 사진 AI 분석 및 우림 가이드 제공</p>
          <p>· 개인 아카이브·기록 저장 및 표시</p>
        </Section>
        <Section title="3. 제3자 처리 위탁">
          <p>· Supabase: 인증·데이터베이스·이미지 저장 (호스팅)</p>
          <p>· OpenAI: 업로드 사진의 AI 분석 처리</p>
          <p>· Google: 소셜 로그인(선택)</p>
          <p>위탁 범위 내에서만 처리되며, 목적 외 이용을 금지합니다.</p>
        </Section>
        <Section title="4. 보유 및 이용 기간">
          <p>
            회원 탈퇴 시 보유한 모든 개인정보·콘텐츠를 지체 없이 파기합니다. 단,
            법령상 보존 의무가 있는 경우 해당 기간 동안 보관합니다.
          </p>
        </Section>
        <Section title="5. 이용자의 권리">
          <p>
            이용자는 언제든 본인 정보를 조회·수정하거나, [내 정보 &gt; 회원 탈퇴]를
            통해 계정과 모든 데이터를 삭제할 수 있습니다.
          </p>
        </Section>
        <Section title="6. 파기 절차">
          <p>
            탈퇴 요청 시 데이터베이스 기록은 연쇄 삭제되고, 저장된 사진은 스토리지에서
            즉시 제거됩니다.
          </p>
        </Section>
        <Section title="7. 개인정보 보호책임자">
          <p>문의: seiyeong@egnis.kr</p>
        </Section>

        <p className="mt-8 text-[12px] text-ink-muted">시행일: 2026-06-22 (초안)</p>
      </main>
    </PhoneFrame>
  );
}
