import { describe, it, expect } from "vitest"
import { generateInviteCode } from "../generate-invite-code"

describe("generateInviteCode", () => {
  it("6자리 코드를 생성한다", () => {
    const code = generateInviteCode()
    expect(code).toHaveLength(6)
  })

  it("대문자 알파벳과 숫자만 포함한다", () => {
    const code = generateInviteCode()
    expect(code).toMatch(/^[A-Z0-9]{6}$/)
  })

  it("여러 번 호출 시 다른 코드를 생성한다", () => {
    const codes = new Set(Array.from({ length: 20 }, () => generateInviteCode()))
    expect(codes.size).toBeGreaterThan(1)
  })

  it("100개 코드가 모두 유효한 형식이다", () => {
    for (let i = 0; i < 100; i++) {
      const code = generateInviteCode()
      expect(code).toHaveLength(6)
      expect(code).toMatch(/^[A-Z0-9]+$/)
    }
  })
})
