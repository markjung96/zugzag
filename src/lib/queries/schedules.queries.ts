import { db } from "@/lib/db"
import { schedules, scheduleRounds, crewMembers, crews, rsvps } from "@/lib/db/schema"
import { eq, gte, asc, and, inArray } from "drizzle-orm"

/**
 * 서버 사이드 쿼리: 사용자의 다가오는 일정 목록
 * prefetchQuery에서 직접 DB 쿼리를 사용해 auth cookie 전달 문제를 우회합니다.
 */
export async function getUserSchedulesQuery(userId: string, limit?: number) {
  const today = new Date().toISOString().split("T")[0]

  const baseQuery = db
    .select({
      id: schedules.id,
      title: schedules.title,
      date: schedules.date,
      description: schedules.description,
      crewId: schedules.crewId,
      crewName: crews.name,
    })
    .from(schedules)
    .innerJoin(crews, eq(schedules.crewId, crews.id))
    .innerJoin(crewMembers, eq(crews.id, crewMembers.crewId))
    .where(and(eq(crewMembers.userId, userId), gte(schedules.date, today)))
    .orderBy(asc(schedules.date))

  const userSchedules = limit ? await baseQuery.limit(limit) : await baseQuery

  if (userSchedules.length === 0) return { schedules: [] }

  const scheduleIds = userSchedules.map((s) => s.id)

  const allRounds = await db
    .select()
    .from(scheduleRounds)
    .where(inArray(scheduleRounds.scheduleId, scheduleIds))
    .orderBy(asc(scheduleRounds.roundNumber))

  const roundsByScheduleId = new Map<string, typeof allRounds>()
  for (const round of allRounds) {
    const existing = roundsByScheduleId.get(round.scheduleId) ?? []
    existing.push(round)
    roundsByScheduleId.set(round.scheduleId, existing)
  }

  const firstRoundIds = userSchedules
    .map((s) => roundsByScheduleId.get(s.id)?.[0]?.id)
    .filter((id): id is string => id !== undefined)

  const allRsvps =
    firstRoundIds.length > 0
      ? await db
          .select({ roundId: rsvps.roundId, userId: rsvps.userId, status: rsvps.status })
          .from(rsvps)
          .where(inArray(rsvps.roundId, firstRoundIds))
      : []

  const rsvpsByRoundId = new Map<string, typeof allRsvps>()
  for (const rsvp of allRsvps) {
    const existing = rsvpsByRoundId.get(rsvp.roundId) ?? []
    existing.push(rsvp)
    rsvpsByRoundId.set(rsvp.roundId, existing)
  }

  const schedulesWithRounds = userSchedules.map((schedule) => {
    const rounds = roundsByScheduleId.get(schedule.id) ?? []
    const firstRound = rounds[0]

    let attendingCount = 0
    let myStatus: string | null = null

    if (firstRound) {
      const roundRsvps = rsvpsByRoundId.get(firstRound.id) ?? []
      attendingCount = roundRsvps.filter((r) => r.status === "attending").length
      const myRsvp = roundRsvps.find((r) => r.userId === userId)
      myStatus = myRsvp?.status === "cancelled" ? null : (myRsvp?.status ?? null)
    }

    return {
      ...schedule,
      rounds,
      startTime: firstRound?.startTime ?? "",
      endTime: firstRound?.endTime ?? "",
      location: firstRound?.location ?? "",
      capacity: firstRound?.capacity ?? 0,
      attendingCount,
      myStatus,
      roundCount: rounds.length,
    }
  })

  return { schedules: schedulesWithRounds }
}
