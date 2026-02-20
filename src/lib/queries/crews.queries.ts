import { db } from "@/lib/db"
import { crews, crewMembers } from "@/lib/db/schema"
import { eq, sql, inArray } from "drizzle-orm"

/**
 * 서버 사이드 쿼리: 사용자가 속한 크루 목록 (멤버 수 포함)
 * prefetchQuery에서 직접 DB 쿼리를 사용해 auth cookie 전달 문제를 우회합니다.
 */
export async function getUserCrewsQuery(userId: string) {
  const userCrews = await db
    .select({
      id: crews.id,
      name: crews.name,
      description: crews.description,
      leaderId: crews.leaderId,
      role: crewMembers.role,
    })
    .from(crewMembers)
    .innerJoin(crews, eq(crewMembers.crewId, crews.id))
    .where(eq(crewMembers.userId, userId))
    .orderBy(crewMembers.joinedAt)

  if (userCrews.length === 0) return { crews: [] }

  const crewIds = userCrews.map((c) => c.id)
  const memberCountRows = await db
    .select({
      crewId: crewMembers.crewId,
      count: sql<number>`count(*)::int`,
    })
    .from(crewMembers)
    .where(inArray(crewMembers.crewId, crewIds))
    .groupBy(crewMembers.crewId)

  const memberCountMap = new Map(memberCountRows.map((r) => [r.crewId, r.count]))

  return {
    crews: userCrews.map((crew) => ({
      id: crew.id,
      name: crew.name,
      description: crew.description,
      role: crew.role,
      memberCount: memberCountMap.get(crew.id) ?? 0,
      isLeader: crew.leaderId === userId,
    })),
  }
}
