import { z } from "zod";

/* ──────────────────────────────────────────────
   Chalog 핵심 데이터 계약 (MVP 명세 §4, §7 기준)
   클라이언트 폼 검증 + OpenAI structured output 공용
   ────────────────────────────────────────────── */

/** 차 종류 옵션 (명세 4-5) */
export const TEA_CATEGORIES = [
  "녹차",
  "백차",
  "황차",
  "우롱차/청차",
  "홍차",
  "흑차/보이차",
  "말차",
  "블렌딩 티",
  "허브티",
  "잘 모르겠음",
] as const;

/** 찻잎 형태 옵션 (명세 4-5) */
export const LEAF_SHAPES = [
  "길고 꼬여 있음",
  "동그랗게 말려 있음",
  "납작함",
  "압축된 덩어리",
  "가루 형태",
  "티백",
  "잘 모르겠음",
] as const;

/** 사용 도구 옵션 (명세 4-5) */
export const BREWING_TOOLS = [
  "머그컵",
  "티팟",
  "개완",
  "자사호",
  "텀블러",
  "잘 모르겠음",
] as const;

export const CONFIDENCE_LEVELS = ["높음", "중간", "낮음"] as const;

/** POST /api/analyze-tea 응답 — AI 1차 분석 결과 */
export const analysisResultSchema = z.object({
  tea_name: z.string().nullable(),
  tea_category: z.enum(TEA_CATEGORIES).nullable(),
  brand: z.string().nullable(),
  origin: z.string().nullable(),
  production_year: z.string().nullable(),
  extracted_text: z.string().default(""),
  confidence_level: z.enum(CONFIDENCE_LEVELS),
  missing_fields: z.array(z.string()).default([]),
  analysis_summary: z.string(),
});
export type AnalysisResult = z.infer<typeof analysisResultSchema>;

/** 사용자 보정 폼 (명세 4-5) — 가이드 생성 요청에 포함 */
export const correctionFormSchema = z.object({
  tea_name: z.string().optional(),
  tea_category: z.enum(TEA_CATEGORIES),
  brand: z.string().optional(),
  origin: z.string().optional(),
  production_year: z.string().optional(),
  leaf_shape: z.enum(LEAF_SHAPES),
  is_compressed: z.boolean().default(false),
  brewing_tool: z.enum(BREWING_TOOLS),
  drinking_style: z.string().optional(),
  user_memo: z.string().optional(),
});
export type CorrectionForm = z.infer<typeof correctionFormSchema>;

/** POST /api/generate-guide 응답 — 우리는 가이드 (명세 4-6) */
export const brewingGuideSchema = z.object({
  water_temperature: z.string(),
  tea_amount: z.string(),
  steeping_time: z.string(),
  recommended_tool: z.string(),
  rinse_method: z.string(),
  guide_text: z.string(),
  adjustment_tips: z.string(),
});
export type BrewingGuide = z.infer<typeof brewingGuideSchema>;

/** 마신 기록 입력 (명세 4-9) */
export const teaLogSchema = z.object({
  brewed_at: z.string(),
  water_temperature: z.string().optional(),
  tea_amount: z.string().optional(),
  steeping_time: z.string().optional(),
  tool: z.enum(BREWING_TOOLS).optional(),
  taste_memo: z.string().optional(),
  aroma_memo: z.string().optional(),
  bitterness_level: z.number().int().min(1).max(5).optional(),
  astringency_level: z.number().int().min(1).max(5).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  next_adjustment: z.string().optional(),
});
export type TeaLog = z.infer<typeof teaLogSchema>;
