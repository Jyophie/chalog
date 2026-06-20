import OpenAI from "openai";

let _client: OpenAI | null = null;

/** 서버 전용 OpenAI 클라이언트 (지연 초기화). 절대 클라이언트 번들에서 import 금지. */
export function getOpenAI(): OpenAI {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

/** 차 라벨 분석에 사용할 Vision 모델 */
export const VISION_MODEL = "gpt-4o";
/** 우리는 가이드 생성에 사용할 텍스트 모델 */
export const GUIDE_MODEL = "gpt-4o";
