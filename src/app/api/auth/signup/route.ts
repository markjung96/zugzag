import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcrypt"

const SignupSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다"),
  name: z.string().min(1, "이름을 입력해주세요").max(50, "이름은 50자 이하여야 합니다"),
  agreedToTerms: z.literal(true, {
    errorMap: () => ({ message: "이용약관에 동의해주세요" }),
  }),
  agreedToPrivacy: z.literal(true, {
    errorMap: () => ({ message: "개인정보 처리방침에 동의해주세요" }),
  }),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = SignupSchema.safeParse(body)

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]
      const message = firstError?.message ?? "입력값이 올바르지 않습니다"
      return NextResponse.json(
        { error: message, code: "BAD_REQUEST" },
        { status: 400 }
      )
    }

    const { email, password, name, agreedToTerms, agreedToPrivacy } = parsed.data

    // 이메일 중복 확인
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "이미 사용 중인 이메일입니다", code: "CONFLICT" },
        { status: 409 }
      )
    }

    // 비밀번호 해싱 (saltRounds: 10)
    const passwordHash = await bcrypt.hash(password, 10)

    // 사용자 생성
    const agreedAt = new Date()
    const newUser = await db
      .insert(users)
      .values({
        email,
        name,
        passwordHash,
        provider: "credentials",
        agreedToTerms,
        agreedToPrivacy,
        agreedAt,
      })
      .returning()

    return NextResponse.json(
      {
        message: "회원가입 성공",
        user: {
          id: newUser[0].id,
          email: newUser[0].email,
          name: newUser[0].name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "회원가입 중 오류가 발생했습니다", code: "INTERNAL_ERROR" },
      { status: 500 }
    )
  }
}
