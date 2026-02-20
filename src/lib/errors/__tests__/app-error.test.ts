import { describe, it, expect } from "vitest"
import {
  AppError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  BadRequestError,
  handleError,
} from "../app-error"

describe("AppError 클래스 계층", () => {
  it("AppError는 올바른 속성을 가진다", () => {
    const err = new AppError("테스트 에러", 400, "TEST")
    expect(err.message).toBe("테스트 에러")
    expect(err.statusCode).toBe(400)
    expect(err.code).toBe("TEST")
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(AppError)
  })

  it("UnauthorizedError는 401이다", () => {
    const err = new UnauthorizedError()
    expect(err.statusCode).toBe(401)
    expect(err.code).toBe("UNAUTHORIZED")
    expect(err).toBeInstanceOf(AppError)
  })

  it("ForbiddenError는 403이다", () => {
    const err = new ForbiddenError()
    expect(err.statusCode).toBe(403)
    expect(err.code).toBe("FORBIDDEN")
  })

  it("NotFoundError는 404이다", () => {
    const err = new NotFoundError()
    expect(err.statusCode).toBe(404)
    expect(err.code).toBe("NOT_FOUND")
  })

  it("ConflictError는 409이다", () => {
    const err = new ConflictError()
    expect(err.statusCode).toBe(409)
    expect(err.code).toBe("CONFLICT")
  })

  it("BadRequestError는 400이다", () => {
    const err = new BadRequestError()
    expect(err.statusCode).toBe(400)
    expect(err.code).toBe("BAD_REQUEST")
  })

  it("커스텀 메시지를 지정할 수 있다", () => {
    const err = new NotFoundError("크루를 찾을 수 없습니다")
    expect(err.message).toBe("크루를 찾을 수 없습니다")
  })
})

describe("handleError", () => {
  it("AppError를 올바른 JSON 응답으로 변환한다", () => {
    const err = new UnauthorizedError()
    const res = handleError(err)
    expect(res.status).toBe(401)
  })

  it("일반 Error를 500으로 처리한다", () => {
    const err = new Error("unexpected")
    const res = handleError(err)
    expect(res.status).toBe(500)
  })

  it("AppError 응답 body에 code가 포함된다", async () => {
    const err = new ForbiddenError("접근 불가")
    const res = handleError(err)
    const body = await res.json()
    expect(body.error).toBe("접근 불가")
    expect(body.code).toBe("FORBIDDEN")
  })
})
