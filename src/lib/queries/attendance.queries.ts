import { db } from "@/lib/db"
import { crews, crewMembers, schedules, scheduleRounds, rsvps } from "@/lib/db/schema"
import { eq, and, sql, lte, inArray } from "drizzle-orm"

/**
 * 서버 사이드 쿼리: 사용자 출석 통계
 * prefetchQuery에서 직접 DB 쿼리를 사용해 auth cookie 전달 문제를 우회합니다.
 */
export async function getUserAttendanceQuery(userId: string, days = 30) {
  const today = new Date().toISOString().split("T")[0]
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startDateStr = startDate.toISOString().split("T")[0]

  const myCrews = await db
    .select({
      crewId: crewMembers.crewId,
      crewName: crews.name,
    })
    .from(crewMembers)
    .innerJoin(crews, eq(crewMembers.crewId, crews.id))
    .where(eq(crewMembers.userId, userId))

  if (myCrews.length === 0) {
    return {
      totalSchedules: 0,
      attendedSchedules: 0,
      attendanceRate: 0,
      crewStats: [],
    }
  }

  const crewIds = myCrews.map((c) => c.crewId)

  const totalRoundsRows = await db
    .select({
      crewId: schedules.crewId,
      scheduleId: schedules.id,
    })
    .from(scheduleRounds)
    .innerJoin(schedules, eq(scheduleRounds.scheduleId, schedules.id))
    .where(
      and(
        inArray(schedules.crewId, crewIds),
        eq(scheduleRounds.type, "exercise"),
        lte(schedules.date, today),
        sql`${schedules.date} >= ${startDateStr}`,
      ),
    )

  const totalSchedulesByCrew = new Map<string, Set<string>>()
  for (const row of totalRoundsRows) {
    const set = totalSchedulesByCrew.get(row.crewId) ?? new Set<string>()
    set.add(row.scheduleId)
    totalSchedulesByCrew.set(row.crewId, set)
  }

  const attendedRows = await db
    .select({
      crewId: schedules.crewId,
      scheduleId: schedules.id,
    })
    .from(rsvps)
    .innerJoin(scheduleRounds, eq(rsvps.roundId, scheduleRounds.id))
    .innerJoin(schedules, eq(scheduleRounds.scheduleId, schedules.id))
    .where(
      and(
        inArray(schedules.crewId, crewIds),
        eq(scheduleRounds.type, "exercise"),
        eq(rsvps.userId, userId),
        eq(rsvps.status, "attending"),
        lte(schedules.date, today),
        sql`${schedules.date} >= ${startDateStr}`,
      ),
    )

  const attendedSchedulesByCrew = new Map<string, Set<string>>()
  for (const row of attendedRows) {
    const set = attendedSchedulesByCrew.get(row.crewId) ?? new Set<string>()
    set.add(row.scheduleId)
    attendedSchedulesByCrew.set(row.crewId, set)
  }

  const crewStats = myCrews.map((crew) => {
    const total = totalSchedulesByCrew.get(crew.crewId)?.size ?? 0
    const attended = attendedSchedulesByCrew.get(crew.crewId)?.size ?? 0
    const attendanceRate = total > 0 ? Math.round((attended / total) * 100) / 100 : 0
    return { crewId: crew.crewId, crewName: crew.crewName, attended, total, attendanceRate }
  })

  const attendedSchedules = crewStats.reduce((sum, c) => sum + c.attended, 0)
  const totalSchedules = crewStats.reduce((sum, c) => sum + c.total, 0)
  const attendanceRate = totalSchedules > 0 ? Math.round((attendedSchedules / totalSchedules) * 100) / 100 : 0

  return { totalSchedules, attendedSchedules, attendanceRate, crewStats }
}
