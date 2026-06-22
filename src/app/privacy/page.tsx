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

/** 국외 이전 항목 카드 */
function TransferCard({
  recipient,
  country,
  items,
  purpose,
  period,
}: {
  recipient: string;
  country: string;
  items: string;
  purpose: string;
  period: string;
}) {
  const rows = [
    ["이전받는 자", recipient],
    ["이전 국가", country],
    ["이전 항목", items],
    ["이전 목적", purpose],
    ["보유·이용 기간", period],
  ];
  return (
    <div className="mt-2 rounded-[14px] border border-hairline bg-field p-3">
      {rows.map(([k, v]) => (
        <div key={k} className="flex gap-2 py-0.5 text-[12px]">
          <span className="w-24 shrink-0 font-bold text-ink-muted">{k}</span>
          <span className="flex-1 text-brand-ink">{v}</span>
        </div>
      ))}
    </div>
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

        <Section title="0. 운영자 정보">
          <p>· 서비스명: chalog</p>
          <p>· 운영자: 주소희 (개인 프로젝트, 비영리·무료)</p>
          <p>· 개인정보 보호책임자 / 문의: jyophie@gmail.com</p>
        </Section>

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

        <Section title="3. 처리위탁">
          <p>· Supabase Inc. — 회원 인증, 데이터베이스, 이미지 저장(호스팅)</p>
          <p>· OpenAI, L.L.C. — 차 사진의 AI 분석 처리</p>
        </Section>

        <Section title="4. 개인정보 국외 이전">
          <p>
            서비스는 아래와 같이 개인정보를 국외로 이전합니다(개인정보보호법
            제28조의8).
          </p>
          <TransferCard
            recipient="OpenAI, L.L.C."
            country="미국"
            items="업로드한 차 사진(이미지)"
            purpose="차 정보 AI 분석"
            period="분석 후 OpenAI 정책에 따라 처리(모델 학습 미사용, 남용 모니터링 목적 최대 30일 보관 후 삭제)"
          />
          <TransferCard
            recipient="Supabase Inc."
            country="호주 (시드니)"
            items="이메일, 닉네임, 차 사진, 시음 기록"
            purpose="인증·데이터 저장·호스팅"
            period="회원 탈퇴 또는 데이터 삭제 시까지"
          />
          <p className="pt-1">
            이전 시기 및 방법: 회원가입·서비스 이용 시 네트워크를 통한 전송.
          </p>
        </Section>

        <Section title="5. AI 학습 사용 여부">
          <p>
            업로드한 사진과 기록은 <b className="text-brand-ink">AI 모델 학습
            목적으로 사용하지 않습니다.</b> AI 분석을 위해 OpenAI API로 전송되며,
            OpenAI는 API로 전송된 데이터를 모델 학습에 사용하지 않습니다.
          </p>
        </Section>

        <Section title="6. 보유 및 이용 기간">
          <p>
            업로드한 사진은 서비스 제공을 위해 저장되며, 이용자가 해당 차/기록을
            삭제하거나 회원 탈퇴할 경우 지체 없이 삭제됩니다. AI 분석을 위해 OpenAI로
            전송된 이미지는 분석 목적 외로 보관·이용되지 않습니다.
          </p>
        </Section>

        <Section title="7. 이용자의 권리">
          <p>
            이용자는 언제든 본인 정보를 조회·수정하거나, [내 정보 &gt; 회원 탈퇴]를
            통해 계정과 모든 데이터를 삭제할 수 있습니다.
          </p>
        </Section>

        <Section title="8. 파기 절차">
          <p>
            탈퇴 또는 삭제 요청 시 데이터베이스 기록은 연쇄 삭제되고, 저장된 사진은
            스토리지에서 즉시 제거됩니다.
          </p>
        </Section>

        <Section title="9. 개인정보 보호책임자">
          <p>주소희 · jyophie@gmail.com</p>
        </Section>

        <p className="mt-8 text-[12px] text-ink-muted">시행일: 2026-06-22 (초안)</p>
      </main>
    </PhoneFrame>
  );
}
