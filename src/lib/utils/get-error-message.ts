const ERROR_CODE_MAP: Record<string, string> = {
  UNAUTHORIZED: "로그인이 필요합니다",
  FORBIDDEN: "권한이 없습니다",
  NOT_FOUND: "찾을 수 없습니다",
  CONFLICT: "이미 존재합니다",
  VALIDATION_ERROR: "입력 정보를 확인해주세요",
  BAD_REQUEST: "입력 정보를 확인해주세요",
  INTERNAL_ERROR:
    "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요",
}

const NETWORK_ERROR_PATTERNS = [
  "failed to fetch",
  "network error",
  "network request failed",
  "load failed",
  "connection",
]

function isNetworkError(message: string): boolean {
  const lower = message.toLowerCase()
  return NETWORK_ERROR_PATTERNS.some((p) => lower.includes(p))
}

/**
 * API 에러 코드를 사용자 친화적인 한국어 메시지로 변환합니다.
 * - fetch/네트워크 에러 → "인터넷 연결을 확인해주세요"
 * - API code 기반 → 매핑된 메시지
 * - 그 외 → "오류가 발생했습니다"
 */
export function getErrorMessage(error: unknown): string {
  if (error == null) {
    return "오류가 발생했습니다"
  }

  // Error 객체 (code 속성이 있을 수 있음 - mutation에서 설정)
  if (error instanceof Error) {
    const errWithCode = error as Error & { code?: string }
    if (errWithCode.code && ERROR_CODE_MAP[errWithCode.code]) {
      return ERROR_CODE_MAP[errWithCode.code]
    }
    if (isNetworkError(error.message)) {
      return "인터넷 연결을 확인해주세요"
    }
    return error.message || "오류가 발생했습니다"
  }

  // { code, error } 형태의 API 응답 객체
  if (typeof error === "object" && error !== null) {
    const obj = error as { code?: string; error?: string }
    if (obj.code && ERROR_CODE_MAP[obj.code]) {
      return ERROR_CODE_MAP[obj.code]
    }
    if (obj.error && typeof obj.error === "string") {
      return obj.error
    }
  }

  return "오류가 발생했습니다"
}

/**
 * API 응답을 안전하게 JSON 파싱합니다.
 * 502 HTML 등 비JSON 응답에서도 크래시하지 않습니다.
 */
export async function parseApiError(res: Response): Promise<Error> {
  const data = (await res.json().catch(() => ({}))) as { error?: string; code?: string }
  const err = new Error(data.error ?? `요청에 실패했습니다 (${res.status})`) as Error & { code?: string }
  err.code = data.code
  return err
}
