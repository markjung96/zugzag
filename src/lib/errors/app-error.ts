import { NextResponse } from "next/server"
import { z } from "zod"

/**
 * 애플리케이션 에러 클래스
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message)
    this.name = "AppError"
  }
}

/**
 * 인증 에러
 */
export class UnauthorizedError extends AppError {
  constructor(message = "인증이 필요합니다") {
    super(message, 401, "UNAUTHORIZED")
  }
}

/**
 * 권한 에러
 */
export class ForbiddenError extends AppError {
  constructor(message = "권한이 없습니다") {
    super(message, 403, "FORBIDDEN")
  }
}

/**
 * Not Found 에러
 */
export class NotFoundError extends AppError {
  constructor(message = "리소스를 찾을 수 없습니다") {
    super(message, 404, "NOT_FOUND")
  }
}

/**
 * Conflict 에러
 */
export class ConflictError extends AppError {
  constructor(message = "이미 존재하는 리소스입니다") {
    super(message, 409, "CONFLICT")
  }
}

/**
 * Bad Request 에러
 */
export class BadRequestError extends AppError {
  constructor(message = "잘못된 요청입니다") {
    super(message, 400, "BAD_REQUEST")
  }
}

/**
 * Zod 에러 타입 가드
 */
function isZodError(error: unknown): error is z.ZodError {
  return error instanceof z.ZodError
}

/**
 * 에러 핸들러
 */
export function handleError(error: unknown): NextResponse {
  // AppError (커스텀 에러)
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    )
  }

  // Zod Validation Error
  if (isZodError(error)) {
    return NextResponse.json(
      {
        error: "입력값이 올바르지 않습니다",
        code: "VALIDATION_ERROR",
        details: error.issues,
      },
      { status: 400 }
    )
  }

  // 예상하지 못한 에러
  console.error("Unexpected error:", error)
  return NextResponse.json(
    { error: "서버 오류가 발생했습니다", code: "INTERNAL_ERROR" },
    { status: 500 }
  )
}
