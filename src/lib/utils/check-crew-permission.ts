import { cache } from "react"
import { db } from "@/lib/db"
import { crewMembers, crews } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

/**
 * 크루 멤버 여부 확인
 * React.cache()로 요청 단위 중복 제거
 */
export const isCrewMember = cache(
  async (crewId: string, userId: string): Promise<boolean> => {
    const member = await db
      .select()
      .from(crewMembers)
      .where(
        and(eq(crewMembers.crewId, crewId), eq(crewMembers.userId, userId))
      )
      .limit(1)

    return member.length > 0
  }
)

/**
 * 크루장 여부 확인
 * React.cache()로 요청 단위 중복 제거
 */
export const isCrewLeader = cache(
  async (crewId: string, userId: string): Promise<boolean> => {
    const crew = await db
      .select()
      .from(crews)
      .where(eq(crews.id, crewId))
      .limit(1)

    if (crew.length === 0) return false
    return crew[0].leaderId === userId
  }
)

/**
 * 멤버 역할 조회
 * React.cache()로 요청 단위 중복 제거
 */
export const getMemberRole = cache(
  async (
    crewId: string,
    userId: string
  ): Promise<"leader" | "admin" | "member" | null> => {
    const member = await db
      .select({ role: crewMembers.role })
      .from(crewMembers)
      .where(
        and(eq(crewMembers.crewId, crewId), eq(crewMembers.userId, userId))
      )
      .limit(1)

    if (member.length === 0) return null
    return member[0].role
  }
)

/**
 * 운영진(admin) 여부 확인
 */
export const isCrewAdmin = cache(
  async (crewId: string, userId: string): Promise<boolean> => {
    const role = await getMemberRole(crewId, userId)
    return role === "admin"
  }
)

/**
 * 크루장 또는 운영진 여부 확인
 * 일정 CRUD, 통계 조회 등에 사용
 */
export const isCrewLeaderOrAdmin = cache(
  async (crewId: string, userId: string): Promise<boolean> => {
    const role = await getMemberRole(crewId, userId)
    return role === "leader" || role === "admin"
  }
)
