import { describe, it, expect } from "vitest"
import { getErrorMessage } from "../get-error-message"

describe("getErrorMessage", () => {
  it("에러 코드가 있는 Error 객체를 매핑된 메시지로 변환한다", () => {
    const err = new Error("some error") as Error & { code?: string }
    err.code = "UNAUTHORIZED"
    expect(getErrorMessage(err)).toBe("로그인이 필요합니다")
  })

  it("RATE_LIMITED 코드를 올바른 메시지로 변환한다", () => {
    const err = new Error("rate limited") as Error & { code?: string }
    err.code = "RATE_LIMITED"
    expect(getErrorMessage(err)).toBe("요청이 너무 많습니다. 잠시 후 다시 시도해주세요")
  })

  it("네트워크 에러를 감지한다", () => {
    const err = new Error("Failed to fetch")
    expect(getErrorMessage(err)).toBe("인터넷 연결을 확인해주세요")
  })

  it("네트워크 에러 패턴을 대소문자 무시하고 감지한다", () => {
    const err = new Error("Network Error")
    expect(getErrorMessage(err)).toBe("인터넷 연결을 확인해주세요")
  })

  it("null을 기본 메시지로 처리한다", () => {
    expect(getErrorMessage(null)).toBe("오류가 발생했습니다")
  })

  it("undefined를 기본 메시지로 처리한다", () => {
    expect(getErrorMessage(undefined)).toBe("오류가 발생했습니다")
  })

  it("API 응답 객체({ code, error })를 처리한다", () => {
    expect(getErrorMessage({ code: "FORBIDDEN" })).toBe("권한이 없습니다")
  })

  it("API 응답 객체의 error 문자열을 반환한다", () => {
    expect(getErrorMessage({ error: "커스텀 에러 메시지" })).toBe("커스텀 에러 메시지")
  })

  it("알 수 없는 코드면 Error.message를 반환한다", () => {
    const err = new Error("특정 에러") as Error & { code?: string }
    err.code = "UNKNOWN_CODE"
    expect(getErrorMessage(err)).toBe("특정 에러")
  })

  it("모든 에러 코드에 대해 매핑이 존재한다", () => {
    const codes = [
      "UNAUTHORIZED",
      "FORBIDDEN",
      "NOT_FOUND",
      "CONFLICT",
      "VALIDATION_ERROR",
      "BAD_REQUEST",
      "INTERNAL_ERROR",
      "RATE_LIMITED",
    ]
    for (const code of codes) {
      const result = getErrorMessage({ code })
      expect(result).not.toBe("오류가 발생했습니다")
    }
  })
})
