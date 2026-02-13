import { db } from "@/lib/db"
import { crews, crewMembers, users } from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"

/**
 * Crew Repository (Model)
 * 데이터 접근 계층
 */
export class CrewRepository {
  /**
   * 크루 생성
   */
  async create(data: {
    name: string
    description: string | null
    inviteCode: string
    leaderId: string
  }) {
    const result = await db.insert(crews).values(data).returning()
    return result[0]
  }

  /**
   * ID로 크루 조회
   */
  async findById(id: string) {
    const result = await db.select().from(crews).where(eq(crews.id, id)).limit(1)
    return result[0] || null
  }

  /**
   * 초대 코드로 크루 조회
   */
  async findByInviteCode(inviteCode: string) {
    const result = await db
      .select()
      .from(crews)
      .where(eq(crews.inviteCode, inviteCode))
      .limit(1)
    return result[0] || null
  }

  /**
   * 초대 코드 중복 확인
   */
  async existsByInviteCode(inviteCode: string): Promise<boolean> {
    const result = await db
      .select({ id: crews.id })
      .from(crews)
      .where(eq(crews.inviteCode, inviteCode))
      .limit(1)
    return result.length > 0
  }

  /**
   * 크루 수정
   */
  async update(id: string, data: { name: string; description: string | null }) {
    const result = await db
      .update(crews)
      .set(data)
      .where(eq(crews.id, id))
      .returning()
    return result[0] || null
  }

  /**
   * 초대 코드 수정
   */
  async updateInviteCode(id: string, inviteCode: string) {
    const result = await db
      .update(crews)
      .set({ inviteCode })
      .where(eq(crews.id, id))
      .returning()
    return result[0] || null
  }

  /**
   * 크루 삭제
   */
  async delete(id: string): Promise<void> {
    await db.delete(crews).where(eq(crews.id, id))
  }

  /**
   * 크루 멤버 수 조회
   */
  async getMemberCount(crewId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(crewMembers)
      .where(eq(crewMembers.crewId, crewId))
    return result[0]?.count || 0
  }

  /**
   * 크루 멤버 목록 조회 (사용자 정보 포함)
   */
  async getMembers(crewId: string) {
    return await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        role: crewMembers.role,
        joinedAt: crewMembers.joinedAt,
      })
      .from(crewMembers)
      .innerJoin(users, eq(crewMembers.userId, users.id))
      .where(eq(crewMembers.crewId, crewId))
      .orderBy(crewMembers.joinedAt)
  }

  /**
   * 사용자가 속한 크루 목록 조회
   */
  async findByUserId(userId: string) {
    return await db
      .select({
        id: crews.id,
        name: crews.name,
        description: crews.description,
        leaderId: crews.leaderId,
        role: crewMembers.role,
        joinedAt: crewMembers.joinedAt,
      })
      .from(crewMembers)
      .innerJoin(crews, eq(crewMembers.crewId, crews.id))
      .where(eq(crewMembers.userId, userId))
      .orderBy(crewMembers.joinedAt)
  }
}
