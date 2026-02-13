import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcrypt"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "이메일, 비밀번호, 이름은 필수입니다", code: "BAD_REQUEST" },
        { status: 400 }
      )
    }

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
    const newUser = await db
      .insert(users)
      .values({
        email,
        name,
        passwordHash,
        provider: "credentials",
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
