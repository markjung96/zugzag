import { db } from "@/lib/db"
import { crewMembers, crews } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

/**
 * CrewMember Repository (Model)
 * 데이터 접근 계층
 */
export class CrewMemberRepository {
  /**
   * 멤버 추가
   */
  async addMember(crewId: string, userId: string, role: "leader" | "member") {
    const result = await db
      .insert(crewMembers)
      .values({
        crewId,
        userId,
        role,
      })
      .returning()
    return result[0]
  }

  /**
   * 멤버 여부 확인
   */
  async isMember(crewId: string, userId: string): Promise<boolean> {
    const result = await db
      .select({ id: crewMembers.id })
      .from(crewMembers)
      .where(and(eq(crewMembers.crewId, crewId), eq(crewMembers.userId, userId)))
      .limit(1)
    return result.length > 0
  }

  /**
   * 리더 여부 확인
   */
  async isLeader(crewId: string, userId: string): Promise<boolean> {
    const result = await db
      .select({ leaderId: crews.leaderId })
      .from(crews)
      .where(eq(crews.id, crewId))
      .limit(1)

    if (result.length === 0) return false
    return result[0].leaderId === userId
  }

  /**
   * 멤버 역할 조회
   */
  async getMemberRole(
    crewId: string,
    userId: string
  ): Promise<"leader" | "admin" | "member" | null> {
    const result = await db
      .select({ role: crewMembers.role })
      .from(crewMembers)
      .where(and(eq(crewMembers.crewId, crewId), eq(crewMembers.userId, userId)))
      .limit(1)

    if (result.length === 0) return null
    return result[0].role
  }

  /**
   * 사용자가 소속된 모든 크루 ID 조회
   */
  async getUserCrewIds(userId: string): Promise<string[]> {
    const result = await db
      .select({ crewId: crewMembers.crewId })
      .from(crewMembers)
      .where(eq(crewMembers.userId, userId))
    return result.map((r) => r.crewId)
  }

  /**
   * 멤버 삭제 (강퇴 또는 탈퇴)
   */
  async removeMember(crewId: string, userId: string): Promise<void> {
    await db
      .delete(crewMembers)
      .where(and(eq(crewMembers.crewId, crewId), eq(crewMembers.userId, userId)))
  }
}
