import { PhoneFrame } from "@/components/layout/phone-frame";
import { TopBar } from "@/components/layout/top-bar";

export const metadata = { title: "개인정보처리방침 · 차로그 Chalog" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="text-[15px] font-black text-brand-ink">{title}</h2>
      <div className="mt-2 space-y-1.5 text-[13px] leading-relaxed text-ink-muted">
        {children}
      </div>
    </section>
  );
}

function Ul({ children }: { children: React.ReactNode }) {
  return (
    <ul className="list-disc space-y-1 pl-4 marker:text-ink-muted">{children}</ul>
  );
}

/** 위탁·국외이전 항목 카드 */
function InfoCard({ rows }: { rows: [string, string][] }) {
  return (
    <div className="mt-2 rounded-[14px] border border-hairline bg-field p-3">
      {rows.map(([k, v]) => (
        <div key={k} className="flex gap-2 py-0.5 text-[12px]">
          <span className="w-[88px] shrink-0 font-bold text-ink-muted">{k}</span>
          <span className="flex-1 text-brand-ink">{v}</span>
        </div>
      ))}
    </div>
  );
}

/** 개인정보처리방침 */
export default function PrivacyPage() {
  return (
    <PhoneFrame>
      <TopBar title="개인정보처리방침" />
      <main className="flex flex-1 flex-col px-6 pt-2 pb-12">
        <p className="rounded-[12px] bg-tint-cream px-4 py-3 text-[12px] text-[#8b6e52]">
          ⚠️ 본 방침은 초안입니다. 정식 오픈 전 법률 검토 후 확정해주세요.
        </p>

        <div className="mt-5 space-y-1 text-[13px] text-ink-muted">
          <p>시행일: 2026년 6월 22일</p>
          <p>서비스명: 차로그 Chalog</p>
          <p>개인정보처리자: 주소희 (개인 프로젝트)</p>
          <p>문의: jyophie@gmail.com</p>
        </div>

        <p className="mt-4 text-[13px] leading-relaxed text-ink-muted">
          차로그 Chalog(이하 “서비스”)는 이용자의 개인정보를 중요하게 생각하며,
          「개인정보 보호법」 등 관련 법령을 준수합니다. 본 방침은 서비스가 어떤
          개인정보를 수집하고, 어떤 목적으로 이용하며, 어떻게 보관·파기하는지 안내하기
          위한 문서입니다.
        </p>

        <Section title="1. 수집하는 개인정보 항목">
          <p className="font-semibold text-brand-ink">1) 회원가입 및 로그인 시</p>
          <Ul>
            <li>이메일 주소</li>
            <li>닉네임 또는 프로필 이름</li>
            <li>비밀번호(이메일 가입 시)</li>
            <li>소셜 로그인 이용 시 소셜 계정 식별 정보, 이메일, 프로필 이름</li>
          </Ul>
          <p className="pt-1 font-semibold text-brand-ink">
            2) 서비스 이용 과정에서 생성되는 정보
          </p>
          <Ul>
            <li>업로드한 차 사진</li>
            <li>차 이름, 종류, 산지, 브랜드, 생산연도 등 입력·수정한 차 정보</li>
            <li>시음 기록, 메모, 우리 방법, 개인 아카이브 정보</li>
            <li>AI 분석 요청 및 결과 데이터</li>
            <li>서비스 이용 기록, 접속 로그, 기기·브라우저 정보, IP 주소</li>
          </Ul>
          <p className="pt-1 font-semibold text-brand-ink">3) 문의 시</p>
          <Ul>
            <li>이메일 주소, 문의 내용, 답변 및 처리 기록</li>
          </Ul>
          <p className="pt-1">
            서비스는 민감정보 또는 고유식별정보를 원칙적으로 수집하지 않습니다.
          </p>
        </Section>

        <Section title="2. 개인정보의 수집 및 이용 목적">
          <Ul>
            <li>회원 식별 및 로그인, 계정 생성·관리</li>
            <li>차 사진 AI 분석 기능 제공</li>
            <li>우리 가이드 생성 및 개인 기록 저장</li>
            <li>개인 차 아카이브 표시 및 관리</li>
            <li>서비스 오류 확인, 기능 개선, 보안 관리</li>
            <li>이용자 문의 응대</li>
            <li>부정 이용 방지 및 서비스 안정성 확보</li>
          </Ul>
          <p>서비스는 수집 목적과 관련 없는 용도로 개인정보를 이용하지 않습니다.</p>
        </Section>

        <Section title="3. 개인정보의 보유 및 이용 기간">
          <Ul>
            <li>회원 계정 정보: 회원 탈퇴 시까지</li>
            <li>업로드한 차 사진 및 기록: 이용자가 삭제하거나 회원 탈퇴할 때까지</li>
            <li>문의 기록: 문의 처리 완료 후 3년까지</li>
            <li>서비스 이용 기록 및 접속 로그: 보안·오류 대응을 위해 최대 1년 보관</li>
            <li>법령상 보존 의무가 있는 정보: 해당 법령에서 정한 기간 동안 보관</li>
          </Ul>
          <p>
            회원 탈퇴 시 서비스는 법령상 보존 의무가 있는 경우를 제외하고 이용자의
            개인정보와 콘텐츠를 지체 없이 파기합니다.
          </p>
        </Section>

        <Section title="4. 개인정보의 제3자 제공">
          <p>서비스는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.</p>
          <p>다만 다음의 경우 예외적으로 제공될 수 있습니다.</p>
          <Ul>
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령에 따라 요청이 있는 경우</li>
            <li>수사기관·법원 등 적법한 절차에 따른 요청이 있는 경우</li>
            <li>서비스 제공에 필요한 범위 내에서 아래의 처리 위탁이 이루어지는 경우</li>
          </Ul>
        </Section>

        <Section title="5. 개인정보 처리 위탁">
          <p>서비스는 원활한 서비스 제공을 위해 다음과 같이 처리를 위탁합니다.</p>
          <InfoCard
            rows={[
              ["수탁업체", "Supabase Inc."],
              ["위탁 업무", "회원 인증, 데이터베이스, 이미지 저장, 서버 인프라"],
              ["처리 정보", "이메일, 계정 정보, 업로드 사진, 기록 데이터"],
            ]}
          />
          <InfoCard
            rows={[
              ["수탁업체", "OpenAI, L.L.C."],
              ["위탁 업무", "업로드 사진·입력 정보 기반 AI 분석 처리"],
              ["처리 정보", "차 사진, 이용자가 입력한 차 정보"],
            ]}
          />
          <InfoCard
            rows={[
              ["수탁업체", "Google LLC"],
              ["위탁 업무", "소셜 로그인 기능 제공"],
              ["처리 정보", "소셜 계정 식별 정보, 이메일, 프로필 이름"],
            ]}
          />
          <InfoCard
            rows={[
              ["수탁업체", "Vercel Inc."],
              ["위탁 업무", "웹 서비스 배포 및 운영(호스팅)"],
              ["처리 정보", "접속 로그, 서비스 이용 정보"],
            ]}
          />
          <p className="pt-1">
            서비스는 위탁 업체가 개인정보를 안전하게 처리하도록 필요한 범위에서
            관리·감독합니다.
          </p>
        </Section>

        <Section title="6. 국외 이전에 관한 사항">
          <p>
            서비스가 사용하는 일부 외부 서비스는 해외에 서버 또는 운영 법인을 두고
            있어, 개인정보가 국외로 이전·처리될 수 있습니다(개인정보보호법 제28조의8).
            이전 시기 및 방법은 회원가입·서비스 이용 시 네트워크를 통한 전송입니다.
          </p>
          <InfoCard
            rows={[
              ["이전받는 자", "OpenAI, L.L.C."],
              ["이전 국가", "미국"],
              ["이전 항목", "업로드 사진, 입력 정보"],
              ["이전 목적", "차 정보 AI 분석"],
              ["보유 기간", "분석 후 OpenAI 정책에 따름(학습 미사용, 최대 30일 후 삭제)"],
            ]}
          />
          <InfoCard
            rows={[
              ["이전받는 자", "Supabase Inc."],
              ["이전 국가", "호주 (시드니, ap-southeast-2)"],
              ["이전 항목", "계정 정보, 사진, 기록 데이터"],
              ["이전 목적", "인증·데이터 저장·이미지 저장"],
              ["보유 기간", "회원 탈퇴 또는 위탁 계약 종료 시까지"],
            ]}
          />
          <InfoCard
            rows={[
              ["이전받는 자", "Google LLC"],
              ["이전 국가", "미국"],
              ["이전 항목", "소셜 로그인 정보"],
              ["이전 목적", "로그인 인증"],
              ["보유 기간", "회원 탈퇴 또는 연동 해제 시까지"],
            ]}
          />
          <InfoCard
            rows={[
              ["이전받는 자", "Vercel Inc."],
              ["이전 국가", "미국"],
              ["이전 항목", "접속 로그, 서비스 이용 정보"],
              ["이전 목적", "웹 서비스 배포·운영"],
              ["보유 기간", "서비스 운영 기간 동안"],
            ]}
          />
        </Section>

        <Section title="7. 개인정보의 파기 절차 및 방법">
          <p>
            서비스는 보유 기간이 지나거나 처리 목적이 달성된 경우 해당 정보를 지체 없이
            파기합니다.
          </p>
          <Ul>
            <li>전자적 파일은 복구할 수 없는 방식으로 삭제합니다.</li>
            <li>데이터베이스 기록은 삭제 또는 비식별 처리합니다.</li>
            <li>이미지 스토리지의 사진은 삭제 요청 또는 회원 탈퇴 시 제거합니다.</li>
            <li>백업 데이터는 운영 정책에 따라 일정 기간 후 순차적으로 삭제됩니다.</li>
          </Ul>
        </Section>

        <Section title="8. 이용자의 권리">
          <Ul>
            <li>개인정보 조회·수정·삭제</li>
            <li>회원 탈퇴</li>
            <li>개인정보 처리 정지 요청</li>
            <li>동의 철회</li>
          </Ul>
          <p>
            이용자는 서비스 내 [내 정보] 또는 문의 이메일을 통해 위 권리를 행사할 수
            있습니다.
          </p>
        </Section>

        <Section title="9. 개인정보의 안전성 확보 조치">
          <Ul>
            <li>계정 비밀번호 암호화 또는 인증 서비스 기반 보호</li>
            <li>접근 권한 제한, 데이터베이스·스토리지 접근 관리</li>
            <li>외부 API 키 및 인증 정보 보호</li>
            <li>보안 업데이트 및 오류 모니터링</li>
            <li>불필요한 개인정보 수집 최소화</li>
          </Ul>
        </Section>

        <Section title="10. 쿠키 및 유사 기술의 이용">
          <p>
            서비스는 로그인 유지, 이용 편의 제공, 서비스 개선을 위해 쿠키 또는 유사
            기술을 사용할 수 있습니다. 이용자는 브라우저 설정으로 쿠키를 거부·삭제할 수
            있으나, 이 경우 로그인 유지 등 일부 기능 이용이 어려울 수 있습니다.
          </p>
        </Section>

        <Section title="11. AI 분석 데이터 처리에 관한 안내">
          <Ul>
            <li>
              AI 분석은 차 종류·포장 정보·산지·특징·우리 방법 등의 참고 정보를 제공하기
              위한 목적입니다.
            </li>
            <li>업로드한 사진에 개인정보가 포함되지 않도록 주의해 주세요.</li>
            <li>이용자는 AI 분석 결과를 직접 확인하고 수정할 수 있습니다.</li>
            <li>서비스는 AI 분석 결과의 정확성을 보장하지 않습니다.</li>
            <li>
              AI 분석을 위해 전송된 사진과 입력 정보는{" "}
              <b className="text-brand-ink">AI 모델 학습 목적으로 사용되지 않으며</b>,
              서비스 제공 목적 범위 내에서만 처리됩니다.
            </li>
          </Ul>
        </Section>

        <Section title="12. 아동의 개인정보">
          <p>
            서비스는 원칙적으로 만 14세 미만 아동을 대상으로 하지 않습니다. 만 14세 미만
            아동이 이용하려는 경우 법정대리인의 동의가 필요할 수 있습니다.
          </p>
        </Section>

        <Section title="13. 개인정보 보호책임자">
          <p>개인정보 보호책임자: 주소희</p>
          <p>이메일: jyophie@gmail.com</p>
        </Section>

        <Section title="14. 개인정보처리방침의 변경">
          <p>
            본 방침은 법령, 서비스 내용, 개인정보 처리 방식의 변경에 따라 수정될 수
            있으며, 변경 사항은 서비스 화면 또는 공지사항을 통해 안내합니다.
          </p>
        </Section>

        <p className="mt-8 text-[12px] text-ink-muted">시행일: 2026년 6월 22일 (초안)</p>
      </main>
    </PhoneFrame>
  );
}
