import { PhoneFrame } from "@/components/layout/phone-frame";
import { TopBar } from "@/components/layout/top-bar";

export const metadata = { title: "이용약관 · 차로그 Chalog" };

function Article({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="text-[15px] font-black text-brand-ink">{title}</h2>
      <div className="mt-2 space-y-1.5 text-[13px] leading-relaxed text-ink-muted">
        {children}
      </div>
    </section>
  );
}

function Ol({ children }: { children: React.ReactNode }) {
  return (
    <ol className="list-decimal space-y-1.5 pl-4 marker:text-ink-muted">
      {children}
    </ol>
  );
}

function Ul({ children }: { children: React.ReactNode }) {
  return (
    <ul className="list-disc space-y-1 pl-4 marker:text-ink-muted">{children}</ul>
  );
}

/** 이용약관 */
export default function TermsPage() {
  return (
    <PhoneFrame>
      <TopBar title="이용약관" />
      <main className="flex flex-1 flex-col px-6 pt-2 pb-12">
        <p className="rounded-[12px] bg-tint-cream px-4 py-3 text-[12px] text-[#8b6e52]">
          ⚠️ 본 약관은 초안입니다. 정식 오픈 전 법률 검토 후 확정해주세요.
        </p>

        <div className="mt-5 space-y-1 text-[13px] text-ink-muted">
          <p>시행일: 2026년 6월 22일</p>
          <p>서비스명: 차로그 Chalog</p>
          <p>운영자: 주소희 (개인 프로젝트, 비영리·무료)</p>
          <p>문의: jyophie@gmail.com</p>
        </div>

        <Article title="제1조 (목적)">
          <p>
            본 약관은 차로그 Chalog(이하 “서비스”)가 제공하는 차 사진 기반 AI 분석,
            우리 가이드 생성, 시음 기록 및 개인 아카이브 저장 서비스의 이용 조건과
            절차, 서비스와 이용자의 권리·의무 및 책임사항을 정하는 것을 목적으로
            합니다.
          </p>
        </Article>

        <Article title="제2조 (정의)">
          <p>본 약관에서 사용하는 용어의 뜻은 다음과 같습니다.</p>
          <Ul>
            <li>
              “서비스”란 이용자가 차 사진을 업로드하고, AI 분석 결과를 확인·수정하며,
              차 우리 가이드와 개인 기록을 저장할 수 있는 차 기록 서비스를 의미합니다.
            </li>
            <li>
              “이용자”란 본 약관에 따라 서비스를 이용하는 회원 또는 비회원을
              의미합니다.
            </li>
            <li>
              “회원”이란 이메일 또는 소셜 로그인을 통해 계정을 생성하고 서비스를
              이용하는 자를 의미합니다.
            </li>
            <li>
              “콘텐츠”란 이용자가 업로드하거나 작성한 차 사진, 차 이름, 산지, 종류,
              시음 기록, 메모, 수정 정보 등을 의미합니다.
            </li>
            <li>
              “AI 분석 결과”란 이용자가 업로드한 사진 또는 입력 정보를 바탕으로
              서비스가 자동으로 제공하는 차 관련 참고 정보를 의미합니다.
            </li>
          </Ul>
        </Article>

        <Article title="제3조 (약관의 효력 및 변경)">
          <Ol>
            <li>본 약관은 서비스 화면 또는 연결된 페이지에 게시함으로써 효력이 발생합니다.</li>
            <li>
              서비스는 필요한 경우 관련 법령을 위반하지 않는 범위에서 본 약관을 변경할
              수 있습니다.
            </li>
            <li>
              약관이 변경되는 경우, 변경 내용과 시행일을 서비스 내 공지 또는 기타
              적절한 방법으로 안내합니다.
            </li>
            <li>
              이용자가 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 회원
              탈퇴를 요청할 수 있습니다.
            </li>
          </Ol>
        </Article>

        <Article title="제4조 (서비스의 내용)">
          <p>서비스는 다음 기능을 제공합니다.</p>
          <Ul>
            <li>차 사진 업로드 및 저장</li>
            <li>AI 기반 차 정보 분석</li>
            <li>차 종류, 산지, 특징, 우리 방법 등에 대한 참고 정보 제공</li>
            <li>이용자의 정보 수정 및 보정</li>
            <li>개인 차 아카이브 및 시음 기록 저장</li>
            <li>기타 서비스가 정하는 차 기록 관련 기능</li>
          </Ul>
          <p>
            서비스는 초기 운영 단계 또는 실험적 기능을 포함할 수 있으며, 일부 기능은
            사전 고지 후 변경, 중단 또는 제한될 수 있습니다.
          </p>
        </Article>

        <Article title="제5조 (회원가입 및 계정 관리)">
          <Ol>
            <li>이용자는 이메일 또는 소셜 로그인 방식으로 회원가입을 할 수 있습니다.</li>
            <li>
              이용자는 정확한 정보를 제공해야 하며, 타인의 정보를 무단으로 사용해서는
              안 됩니다.
            </li>
            <li>계정 정보 및 비밀번호 관리 책임은 이용자에게 있습니다.</li>
            <li>
              계정의 도용 또는 무단 사용이 의심되는 경우 이용자는 즉시 서비스에 알려야
              합니다.
            </li>
            <li>
              서비스는 허위 정보 제공, 타인 계정 사용, 서비스 운영 방해 등이 확인될
              경우 계정 이용을 제한할 수 있습니다.
            </li>
          </Ol>
        </Article>

        <Article title="제6조 (이용자의 의무)">
          <p>이용자는 서비스를 이용할 때 다음 행위를 해서는 안 됩니다.</p>
          <Ul>
            <li>타인의 개인정보, 사진, 저작물 등을 무단으로 업로드하는 행위</li>
            <li>타인의 권리나 명예를 침해하는 행위</li>
            <li>법령 또는 공서양속에 반하는 콘텐츠를 업로드하는 행위</li>
            <li>서비스의 정상적인 운영을 방해하는 행위</li>
            <li>자동화 도구, 크롤링, 해킹 등 비정상적인 방식으로 서비스에 접근하는 행위</li>
            <li>AI 분석 결과를 검증 없이 상업적·전문적 판단의 근거로 사용하는 행위</li>
            <li>기타 서비스가 부적절하다고 판단하는 행위</li>
          </Ul>
        </Article>

        <Article title="제7조 (AI 분석 결과에 대한 안내)">
          <Ol>
            <li>
              서비스가 제공하는 AI 분석 결과는 이용자의 차 기록을 돕기 위한 참고
              정보입니다.
            </li>
            <li>
              AI 분석 결과는 사진의 품질, 포장 상태, 글자 인식 여부, 데이터 한계 등에
              따라 부정확할 수 있습니다.
            </li>
            <li>서비스는 AI 분석 결과의 정확성, 완전성, 신뢰성을 보장하지 않습니다.</li>
            <li>
              이용자는 AI 분석 결과를 직접 확인하고 수정할 수 있으며, 최종 기록 내용에
              대한 판단과 이용 책임은 이용자에게 있습니다.
            </li>
          </Ol>
        </Article>

        <Article title="제8조 (콘텐츠의 권리와 이용)">
          <Ol>
            <li>이용자가 업로드하거나 작성한 콘텐츠의 권리는 원칙적으로 이용자에게 있습니다.</li>
            <li>
              이용자는 서비스 운영 및 기능 제공에 필요한 범위 내에서 서비스가 콘텐츠를
              저장, 분석, 표시, 가공할 수 있도록 허락합니다.
            </li>
            <li>
              서비스는 이용자의 콘텐츠를 서비스 제공 목적 범위를 넘어 임의로 외부에
              공개하거나 판매하지 않습니다.
            </li>
            <li>
              이용자가 타인의 권리를 침해하는 콘텐츠를 업로드한 경우, 그로 인해
              발생하는 책임은 이용자에게 있습니다.
            </li>
            <li>
              서비스는 권리 침해 신고, 법령 위반, 서비스 운영상 필요가 있는 경우 해당
              콘텐츠를 제한하거나 삭제할 수 있습니다.
            </li>
          </Ol>
        </Article>

        <Article title="제9조 (서비스의 변경 및 중단)">
          <Ol>
            <li>
              서비스는 운영상, 기술상 필요에 따라 서비스의 전부 또는 일부를 변경하거나
              중단할 수 있습니다.
            </li>
            <li>서비스 중단이 예정된 경우 가능한 범위에서 사전에 안내합니다.</li>
            <li>다음의 경우 사전 안내 없이 서비스가 일시 중단될 수 있습니다.</li>
          </Ol>
          <Ul>
            <li>시스템 점검, 장애, 보안 문제</li>
            <li>외부 클라우드, 데이터베이스, AI API 등 제휴·위탁 서비스의 장애</li>
            <li>천재지변, 통신 장애, 기타 불가항력적 사유</li>
          </Ul>
        </Article>

        <Article title="제10조 (회원 탈퇴 및 데이터 삭제)">
          <Ol>
            <li>
              이용자는 언제든지 서비스 내 기능 또는 문의를 통해 회원 탈퇴를 요청할 수
              있습니다.
            </li>
            <li>
              회원 탈퇴 시 이용자의 계정 정보, 업로드한 사진, 시음 기록, 개인 아카이브
              데이터는 관련 법령상 보존 의무가 있는 경우를 제외하고 삭제됩니다.
            </li>
            <li>
              단, 백업 데이터의 경우 시스템 운영 방식에 따라 일정 기간 후 순차적으로
              삭제될 수 있습니다.
            </li>
          </Ol>
        </Article>

        <Article title="제11조 (개인정보 보호)">
          <p>
            서비스는 이용자의 개인정보를 관련 법령에 따라 보호하며, 개인정보의
            수집·이용·보관·파기 등에 관한 구체적인 사항은 별도의 개인정보처리방침에
            따릅니다.
          </p>
        </Article>

        <Article title="제12조 (책임의 제한)">
          <Ol>
            <li>
              서비스는 무료로 제공되는 초기 서비스로서, 관련 법령이 허용하는 범위 내에서
              서비스 이용으로 발생한 손해에 대해 책임을 지지 않습니다.
            </li>
            <li>
              서비스는 AI 분석 결과 또는 추천 정보의 정확성, 적합성, 완전성을 보장하지
              않습니다.
            </li>
            <li>
              이용자가 서비스를 통해 저장한 정보의 활용, 해석, 외부 공유로 인해 발생하는
              문제는 이용자의 책임입니다.
            </li>
            <li>
              서비스는 이용자의 귀책사유, 제3자 서비스 장애, 불가항력적 사유로 인한
              손해에 대해 책임을 지지 않습니다.
            </li>
          </Ol>
        </Article>

        <Article title="제13조 (분쟁 해결)">
          <Ol>
            <li>본 약관은 대한민국 법령에 따라 해석됩니다.</li>
            <li>
              서비스와 이용자 사이에 분쟁이 발생한 경우 상호 협의하여 해결하는 것을
              원칙으로 합니다.
            </li>
            <li>
              협의가 어려운 경우 관련 법령에 따른 관할 법원 또는 분쟁조정기관을 통해
              해결할 수 있습니다.
            </li>
          </Ol>
        </Article>

        <Article title="제14조 (문의)">
          <p>서비스 이용 및 약관 관련 문의는 아래 연락처로 접수할 수 있습니다.</p>
          <p>운영자: 주소희 · 문의 이메일: jyophie@gmail.com</p>
        </Article>

        <p className="mt-8 text-[12px] text-ink-muted">시행일: 2026년 6월 22일 (초안)</p>
      </main>
    </PhoneFrame>
  );
}
