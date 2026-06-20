# chalog 🍵

> 차 사진으로 시작하는 나만의 티 아카이브

차 패키지·라벨·찻잎 사진을 올리면 AI가 차 정보를 1차 분석하고, 사용자가 부족한 정보를 보정하면
그 차에 맞는 **우리는 가이드**를 생성해 **내 차 아카이브**에 저장·기록하는 AI 티 가이드 서비스.

차 이름을 정확히 맞히는 앱이 아니라, "오늘 이 차를 어떻게 우려 마실지" 빠르게 알려주는 데 집중합니다.

## 기술 스택

| 레이어 | 사용 |
|--------|------|
| 프레임워크 | Next.js 16 (App Router) · TypeScript · Turbopack |
| 백엔드 | Next.js Route Handlers (`/api/*`) |
| DB / 인증 / 스토리지 | Supabase (Postgres · Auth · Storage) |
| AI | OpenAI (Vision 분석 · 가이드 생성) |
| 데이터 페칭 | TanStack Query |
| 폼 상태 | 등록 플로우 Zustand · 폼 react-hook-form + Zod |
| 스타일 | Tailwind CSS v4 · shadcn/ui |
| 배포 | Vercel |

## 로컬 실행

```bash
npm install
cp .env.local.example .env.local   # 값 채우기 (Supabase / OpenAI)
npm run dev                          # http://localhost:3000
```

### 환경변수
`.env.local.example` 참고. Supabase URL/키, OpenAI 키 필요.

### DB 마이그레이션
`supabase/migrations/0001_init.sql` 을 Supabase SQL Editor에서 실행
(테이블 4개 + RLS + Storage 버킷).

## 화면 구성 (MVP)

랜딩 → 로그인 → 업로드 → AI 분석 → 분석 결과 → 정보 보정 → 브루잉 가이드 → 아카이브 → 차 상세 → 기록 추가

## 프로젝트 구조

```
src/
├─ app/                 라우트 + Route Handlers
├─ components/          UI 컴포넌트 (providers 포함)
├─ lib/
│  ├─ supabase/         client / server
│  ├─ openai/           OpenAI 클라이언트
│  ├─ schemas/          Zod 데이터 계약
│  └─ types/            DB 타입
└─ store/               Zustand (등록 플로우)
supabase/migrations/    DB 스키마
```
