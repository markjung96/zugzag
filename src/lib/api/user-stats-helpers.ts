/**
 * 사용자 통계 API Helper 함수
 * 서버 컴포넌트 및 API 라우트에서 사용
 */

import type { Tables } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

type Gym = Tables<"gyms">;

// 사용자 통계 타입 정의
export interface UserStats {
  // 핵심 지표
  totalAttended: number; // 실제 참석한 일정 수
  totalRegistered: number; // 신청한 일정 수
  attendanceRate: number; // 참석률 (%)
  noShowRate: number; // 노쇼율 (%)
  thisMonthAttendances: number; // 이번 달 참석 수
  totalCrews: number; // 활동 크루 수
  currentStreak: number; // 연속 참석 일수

  // 선호도 분석
  favoriteGyms: GymVisitStat[]; // 선호 암장 TOP 5
  favoriteTimeSlot: TimeSlotStat[]; // 선호 시간대
  favoriteDayOfWeek: DayOfWeekStat[]; // 선호 요일
  phasePreference: PhasePreferenceStat; // 단계별 선호도

  // 활동 추이
  monthlyActivity: MonthlyActivityData[]; // 월별 활동 추이 (최근 6개월)
  crewActivity: CrewActivityStat[]; // 크루별 활동량

  // 최근 활동
  recentActivities: RecentActivity[]; // 최근 10개 활동
}

export interface GymVisitStat {
  gym: Pick<Gym, "id" | "name" | "address">;
  visitCount: number;
  attendanceRate: number; // 해당 암장 참석률
}

export interface TimeSlotStat {
  timeSlot: string; // "오전", "오후", "저녁", "야간"
  count: number;
  percentage: number;
}

export interface DayOfWeekStat {
  dayOfWeek: number; // 0-6 (일-토)
  dayName: string; // "월", "화", ...
  count: number;
  percentage: number;
}

export interface PhasePreferenceStat {
  onlyFirstPhase: number; // 1차만 참석
  multiplePhases: number; // 2차 이상 참석
  preferenceRate: number; // 2차 이상 참석 비율
}

export interface MonthlyActivityData {
  month: string; // "2025-01"
  attended: number;
  registered: number;
  attendanceRate: number;
}

export interface CrewActivityStat {
  crew: {
    id: string;
    name: string;
    logo_url: string | null;
  };
  attended: number;
  registered: number;
  attendanceRate: number;
}

export interface RecentActivity {
  id: string;
  type: "rsvp" | "checkin" | "checkout" | "noshow";
  schedule: {
    id: string;
    title: string;
    event_date: string;
  };
  status: string;
  created_at: string;
}

export interface UserStatsResponse {
  stats: UserStats;
}

/**
 * 사용자 통계 조회
 */
export async function getUserStats(userId: string): Promise<UserStatsResponse> {
  const supabase = await createClient();

  // 1. 핵심 지표 계산
  const { data: attendances } = await supabase
    .from("schedule_attendances")
    .select(
      `
      id,
      status,
      checked_in_at,
      created_at,
      phase_id,
      schedule:schedules!schedule_attendances_schedule_id_fkey(
        id,
        title,
        event_date,
        crew_id,
        crew:crews(id, name, logo_url)
      )
    `,
    )
    .eq("user_id", userId);

  const totalRegistered = attendances?.length || 0;
  const totalAttended = attendances?.filter((a) => a.checked_in_at !== null).length || 0;
  const noShowCount = attendances?.filter((a) => a.status === "no_show").length || 0;
  const attendanceRate = totalRegistered > 0 ? (totalAttended / totalRegistered) * 100 : 0;
  const noShowRate = totalRegistered > 0 ? (noShowCount / totalRegistered) * 100 : 0;

  // 이번 달 참석 수
  const thisMonth = new Date();
  const thisMonthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
  const thisMonthAttendances =
    attendances?.filter((a) => {
      if (!a.checked_in_at) return false;
      const checkedInDate = new Date(a.checked_in_at);
      return checkedInDate >= thisMonthStart;
    }).length || 0;

  // 크루 수
  const { count: totalCrews } = await supabase
    .from("crew_members")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  // 연속 참석 스트릭 (간단 버전: 연속으로 참석한 일정 수)
  const sortedAttendances = (attendances || [])
    .filter((a) => a.checked_in_at !== null)
    .sort(
      (a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime(),
    );
  let currentStreak = 0;
  for (const attendance of sortedAttendances) {
    if (attendance.checked_in_at) {
      currentStreak++;
    } else {
      break;
    }
  }

  // 2. 선호 암장 분석
  const { data: gymVisits } = await supabase
    .from("schedule_attendances")
    .select(
      `
      id,
      status,
      checked_in_at,
      schedule:schedules!schedule_attendances_schedule_id_fkey(
        id,
        phases:schedule_phases(
          gym_id,
          gym:gyms(id, name, address)
        )
      )
    `,
    )
    .eq("user_id", userId)
    .eq("status", "attending");

  const gymStats = new Map<string, { gym: Gym; total: number; attended: number }>();
  gymVisits?.forEach((visit) => {
    const schedule = visit.schedule as {
      phases: Array<{ gym: Gym | null; gym_id: string | null }>;
    };
    schedule?.phases?.forEach((phase) => {
      if (phase.gym && phase.gym_id) {
        const existing = gymStats.get(phase.gym_id);
        const attended = visit.checked_in_at ? 1 : 0;
        if (existing) {
          existing.total += 1;
          existing.attended += attended;
        } else {
          gymStats.set(phase.gym_id, {
            gym: phase.gym,
            total: 1,
            attended,
          });
        }
      }
    });
  });

  const favoriteGyms: GymVisitStat[] = Array.from(gymStats.entries())
    .map(([_, stat]) => ({
      gym: {
        id: stat.gym.id,
        name: stat.gym.name,
        address: stat.gym.address,
      },
      visitCount: stat.total,
      attendanceRate: stat.total > 0 ? (stat.attended / stat.total) * 100 : 0,
    }))
    .sort((a, b) => b.visitCount - a.visitCount)
    .slice(0, 5);

  // 3. 시간대별 선호도
  const { data: timeData } = await supabase
    .from("schedule_attendances")
    .select(
      `
      id,
      checked_in_at,
      schedule:schedules!schedule_attendances_schedule_id_fkey(
        id,
        phases:schedule_phases(start_time)
      )
    `,
    )
    .eq("user_id", userId)
    .not("checked_in_at", "is", null);

  const timeSlotCounts = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  timeData?.forEach((data) => {
    const schedule = data.schedule as { phases: Array<{ start_time: string }> };
    const startTime = schedule?.phases?.[0]?.start_time;
    if (startTime) {
      const hour = parseInt(startTime.split(":")[0]);
      if (hour >= 6 && hour < 12) timeSlotCounts.morning++;
      else if (hour >= 12 && hour < 18) timeSlotCounts.afternoon++;
      else if (hour >= 18 && hour < 22) timeSlotCounts.evening++;
      else timeSlotCounts.night++;
    }
  });

  const totalTimeSlots = Object.values(timeSlotCounts).reduce((a, b) => a + b, 0);
  const favoriteTimeSlot: TimeSlotStat[] = [
    {
      timeSlot: "오전 (6-12시)",
      count: timeSlotCounts.morning,
      percentage: totalTimeSlots > 0 ? (timeSlotCounts.morning / totalTimeSlots) * 100 : 0,
    },
    {
      timeSlot: "오후 (12-18시)",
      count: timeSlotCounts.afternoon,
      percentage: totalTimeSlots > 0 ? (timeSlotCounts.afternoon / totalTimeSlots) * 100 : 0,
    },
    {
      timeSlot: "저녁 (18-22시)",
      count: timeSlotCounts.evening,
      percentage: totalTimeSlots > 0 ? (timeSlotCounts.evening / totalTimeSlots) * 100 : 0,
    },
    {
      timeSlot: "야간 (22-6시)",
      count: timeSlotCounts.night,
      percentage: totalTimeSlots > 0 ? (timeSlotCounts.night / totalTimeSlots) * 100 : 0,
    },
  ].sort((a, b) => b.count - a.count);

  // 4. 요일별 선호도
  const dayOfWeekCounts = [0, 0, 0, 0, 0, 0, 0];
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  attendances
    ?.filter((a) => a.checked_in_at)
    .forEach((a) => {
      const schedule = a.schedule as { event_date: string };
      const date = new Date(schedule.event_date);
      dayOfWeekCounts[date.getDay()]++;
    });

  const totalDays = dayOfWeekCounts.reduce((a, b) => a + b, 0);
  const favoriteDayOfWeek: DayOfWeekStat[] = dayOfWeekCounts
    .map((count, index) => ({
      dayOfWeek: index,
      dayName: dayNames[index],
      count,
      percentage: totalDays > 0 ? (count / totalDays) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // 5. 단계별 선호도 (각 일정마다 참석한 phase 수 계산)
  const schedulePhaseMap = new Map<string, Set<string>>();
  attendances
    ?.filter((a) => a.checked_in_at && a.phase_id)
    .forEach((a) => {
      const schedule = a.schedule as { id: string };
      if (!schedulePhaseMap.has(schedule.id)) {
        schedulePhaseMap.set(schedule.id, new Set());
      }
      schedulePhaseMap.get(schedule.id)!.add(a.phase_id!);
    });

  const onlyFirstPhase = Array.from(schedulePhaseMap.values()).filter(
    (phases) => phases.size === 1,
  ).length;
  const multiplePhases = Array.from(schedulePhaseMap.values()).filter(
    (phases) => phases.size > 1,
  ).length;
  const totalSchedulesWithPhases = onlyFirstPhase + multiplePhases;
  const phasePreference: PhasePreferenceStat = {
    onlyFirstPhase,
    multiplePhases,
    preferenceRate:
      totalSchedulesWithPhases > 0 ? (multiplePhases / totalSchedulesWithPhases) * 100 : 0,
  };

  // 6. 월별 활동 추이 (최근 6개월)
  const monthlyMap = new Map<string, { attended: number; registered: number }>();
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap.set(monthKey, { attended: 0, registered: 0 });
  }

  attendances?.forEach((a) => {
    const schedule = a.schedule as { event_date: string };
    const date = new Date(schedule.event_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (monthlyMap.has(monthKey)) {
      const stat = monthlyMap.get(monthKey)!;
      stat.registered++;
      if (a.checked_in_at) stat.attended++;
    }
  });

  const monthlyActivity: MonthlyActivityData[] = Array.from(monthlyMap.entries())
    .map(([month, stat]) => ({
      month,
      attended: stat.attended,
      registered: stat.registered,
      attendanceRate: stat.registered > 0 ? (stat.attended / stat.registered) * 100 : 0,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // 7. 크루별 활동량
  const crewMap = new Map<
    string,
    {
      crew: { id: string; name: string; logo_url: string | null };
      attended: number;
      registered: number;
    }
  >();
  attendances?.forEach((a) => {
    const schedule = a.schedule as {
      crew_id: string;
      crew: { id: string; name: string; logo_url: string | null };
    };
    if (schedule?.crew_id && schedule?.crew) {
      const existing = crewMap.get(schedule.crew_id);
      const attended = a.checked_in_at ? 1 : 0;
      if (existing) {
        existing.registered++;
        existing.attended += attended;
      } else {
        crewMap.set(schedule.crew_id, {
          crew: schedule.crew,
          registered: 1,
          attended,
        });
      }
    }
  });

  const crewActivity: CrewActivityStat[] = Array.from(crewMap.values())
    .map((stat) => ({
      crew: stat.crew,
      attended: stat.attended,
      registered: stat.registered,
      attendanceRate: stat.registered > 0 ? (stat.attended / stat.registered) * 100 : 0,
    }))
    .sort((a, b) => b.attended - a.attended);

  // 8. 최근 활동 내역
  const recentActivities: RecentActivity[] = (attendances || [])
    .sort((a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime())
    .slice(0, 10)
    .map((a) => {
      const schedule = a.schedule as {
        id: string;
        title: string;
        event_date: string;
      };
      let type: RecentActivity["type"] = "rsvp";
      if (a.status === "no_show") type = "noshow";
      else if (a.checked_in_at) type = "checkin";

      return {
        id: a.id,
        type,
        schedule: {
          id: schedule.id,
          title: schedule.title,
          event_date: schedule.event_date,
        },
        status: a.status,
        created_at: a.created_at || "",
      };
    });

  const stats: UserStats = {
    totalAttended,
    totalRegistered,
    attendanceRate,
    noShowRate,
    thisMonthAttendances,
    totalCrews: totalCrews || 0,
    currentStreak,
    favoriteGyms,
    favoriteTimeSlot,
    favoriteDayOfWeek,
    phasePreference,
    monthlyActivity,
    crewActivity,
    recentActivities,
  };

  return { stats };
}
