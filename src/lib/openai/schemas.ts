import { TEA_CATEGORIES, CONFIDENCE_LEVELS } from "@/lib/schemas/tea";

/**
 * OpenAI structured output용 JSON Schema (strict mode).
 * 결과는 별도로 Zod(@/lib/schemas/tea)로 한 번 더 검증한다.
 */

export const TEA_ANALYSIS_JSON_SCHEMA = {
  name: "tea_analysis",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "tea_name",
      "tea_category",
      "brand",
      "origin",
      "production_year",
      "extracted_text",
      "confidence_level",
      "missing_fields",
      "analysis_summary",
    ],
    properties: {
      tea_name: { type: ["string", "null"] },
      tea_category: { type: ["string", "null"], enum: [...TEA_CATEGORIES, null] },
      brand: { type: ["string", "null"] },
      origin: { type: ["string", "null"] },
      production_year: { type: ["string", "null"] },
      extracted_text: { type: "string" },
      confidence_level: { type: "string", enum: [...CONFIDENCE_LEVELS] },
      missing_fields: { type: "array", items: { type: "string" } },
      analysis_summary: { type: "string" },
    },
  },
} as const;

export const BREWING_GUIDE_JSON_SCHEMA = {
  name: "brewing_guide",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "water_temperature",
      "tea_amount",
      "steeping_time",
      "recommended_tool",
      "rinse_method",
      "guide_text",
      "adjustment_tips",
    ],
    properties: {
      water_temperature: { type: "string" },
      tea_amount: { type: "string" },
      steeping_time: { type: "string" },
      recommended_tool: { type: "string" },
      rinse_method: { type: "string" },
      guide_text: { type: "string" },
      adjustment_tips: { type: "string" },
    },
  },
} as const;
