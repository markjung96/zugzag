import { db } from "@/lib/db"
import { crews } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

/**
 * 6자리 랜덤 초대 코드 생성
 * 대문자 알파벳 + 숫자 조합 (A-Z, 0-9)
 */
export function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * 중복되지 않는 초대 코드 생성
 * DB에서 중복 확인 후 유니크한 코드 반환
 */
export async function generateUniqueInviteCode(): Promise<string> {
  let code = generateInviteCode()
  let exists = true

  while (exists) {
    const result = await db
      .select()
      .from(crews)
      .where(eq(crews.inviteCode, code))
      .limit(1)

    if (result.length === 0) {
      exists = false
    } else {
      code = generateInviteCode()
    }
  }

  return code
}
