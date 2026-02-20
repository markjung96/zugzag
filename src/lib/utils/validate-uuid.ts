import { BadRequestError } from "@/lib/errors/app-error"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * UUID 형식 검증
 * 유효하지 않은 경우 BadRequestError(400)를 throw합니다.
 *
 * @param value - 검증할 문자열
 * @param label - 에러 메시지에 표시할 파라미터 이름 (예: "크루 ID", "일정 ID")
 */
export function validateUUID(value: string, label = "ID"): void {
  if (!UUID_REGEX.test(value)) {
    throw new BadRequestError(`유효하지 않은 ${label}입니다`)
  }
}
