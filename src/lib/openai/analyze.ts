import { getOpenAI, VISION_MODEL, GUIDE_MODEL } from "./client";
import {
  TEA_ANALYSIS_JSON_SCHEMA,
  BREWING_GUIDE_JSON_SCHEMA,
} from "./schemas";
import {
  analysisResultSchema,
  brewingGuideSchema,
  type AnalysisResult,
  type BrewingGuide,
} from "@/lib/schemas/tea";

const ANALYZE_SYSTEM = `당신은 차(tea) 라벨/패키지/찻잎 사진을 분석하는 전문가입니다.
사진에서 읽을 수 있는 텍스트와 시각적 단서를 바탕으로 차 정보를 추정하세요.

원칙:
- 단정하지 마세요. 불확실하면 null로 두고 missing_fields에 항목명을 넣으세요.
- 차는 라벨이 표준화돼 있지 않습니다. 제품명을 억지로 맞히지 마세요.
- analysis_summary는 한국어로, 부드럽게 작성하세요. 예: "이 차는 우롱차 계열일 가능성이 높아요.", "포장 정보만으로는 정확한 제품명까지 확정하기 어려워요."
- confidence_level은 사진의 정보량에 따라 높음/중간/낮음으로.
- tea_category는 주어진 보기 중 하나거나 null.
- extracted_text는 사진에서 실제로 읽힌 텍스트(없으면 빈 문자열).`;

export async function analyzeTea(imageUrl: string): Promise<AnalysisResult> {
  const client = getOpenAI();
  const res = await client.chat.completions.create({
    model: VISION_MODEL,
    temperature: 0.2,
    messages: [
      { role: "system", content: ANALYZE_SYSTEM },
      {
        role: "user",
        content: [
          { type: "text", text: "이 차 사진을 분석해 주세요." },
          { type: "image_url", image_url: { url: imageUrl, detail: "auto" } },
        ],
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: TEA_ANALYSIS_JSON_SCHEMA,
    },
  });

  const raw = res.choices[0]?.message?.content ?? "{}";
  return analysisResultSchema.parse(JSON.parse(raw));
}

export interface GuideInput {
  tea_name?: string | null;
  tea_category?: string | null;
  brand?: string | null;
  origin?: string | null;
  production_year?: string | null;
  leaf_shape?: string | null;
  is_compressed?: boolean;
  brewing_tool?: string | null;
  drinking_style?: string | null;
  user_memo?: string | null;
}

const GUIDE_SYSTEM = `당신은 차 우리는 법을 알려주는 친절한 티 가이드입니다.
주어진 차 정보(AI 분석 + 사용자 보정)를 바탕으로 실용적인 우리는 가이드를 한국어로 작성하세요.

원칙:
- 입문자도 따라 할 수 있게 구체적인 수치(온도 범위, 시간, 차 양)를 제시하세요.
- "잘 모르겠음" 항목이 있어도 일반적인 기준으로 합리적으로 추천하세요.
- water_temperature 예: "90~95°C", tea_amount 예: "100ml 기준 4~5g", steeping_time 예: "첫 우림 20~30초".
- guide_text는 1포/2포/3포 등 여러 번 우리는 흐름을 문단으로 설명.
- adjustment_tips는 맛이 진할 때/약할 때 조정법을 포함.
- rinse_method는 세차(차 헹굼) 권장 여부와 방법.`;

export async function generateGuide(input: GuideInput): Promise<BrewingGuide> {
  const client = getOpenAI();
  const res = await client.chat.completions.create({
    model: GUIDE_MODEL,
    temperature: 0.4,
    messages: [
      { role: "system", content: GUIDE_SYSTEM },
      {
        role: "user",
        content: `다음 차에 맞는 우리는 가이드를 만들어 주세요.\n${JSON.stringify(
          input,
          null,
          2,
        )}`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: BREWING_GUIDE_JSON_SCHEMA,
    },
  });

  const raw = res.choices[0]?.message?.content ?? "{}";
  return brewingGuideSchema.parse(JSON.parse(raw));
}
