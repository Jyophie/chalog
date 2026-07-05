/**
 * 운영자(관리자) 이메일 판별.
 * ADMIN_EMAILS 환경변수(쉼표 구분)로 설정, 미설정 시 운영자 기본값.
 * 이메일은 이미 약관/개인정보처리방침에 공개된 연락처라 민감정보 아님.
 */
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "jyophie@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
