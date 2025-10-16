/**
 * 크루 통계 API Helper 함수
 * 서버 컴포넌트 및 API 라우트에서 사용
 */

import type { Tables } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

// 타입 정의
type Crew = Tables<"crews">;
type Profile = Tables<"profiles">;
type ActivityLog = Tables<"activity_logs">;

// 통계 반환 타입들
export interface MemberGrowthData {
  month: string;
  count: number;
  newMembers: number;
}

export interface MemberAttendanceStat {
  user: {
    id: string;
    full_name: string | null;
    nickname: string | null;
    avatar_url: string | null;
  };
  totalSchedules: number;
  attended: number;
  attendanceRate: number;
}

export interface GymStat {
  gym: {
    id: string;
    name: string;
    address: string | null;
    location: string | null;
  };
  count: number;
}

export interface DayDistributionData {
  day: string;
  dayOfWeek: number;
  count: number;
}

export interface TimeDistributionData {
  timeSlot: string;
  count: number;
}

export interface DayAttendanceRateData {
  day: string;
  dayOfWeek: number;
  attendanceRate: number;
  totalSchedules: number;
  totalAttended: number;
}

export interface TimeAttendanceRateData {
  timeSlot: string;
  attendanceRate: number;
  totalSchedules: number;
  totalAttended: number;
}

export interface GymAttendanceRateData {
  gym: {
    id: string;
    name: string;
    address: string | null;
  };
  attendanceRate: number;
  totalSchedules: number;
  totalAttended: number;
}

export interface CrewBasicStats {
  crew: Crew;
  totalMembers: number;
  totalSchedules: number;
  completedSchedules: number;
  upcomingSchedules: number;
  totalAttendances: number;
  checkedInCount: number;
  attendanceRate: number;
  // 추가 지표
  averageAttendees: number; // 일정당 평균 참석자 수
  noShowRate: number; // 노쇼율
  newMemberConversionRate: number; // 신규 멤버 전환율 (가입 후 첫 참석 비율)
  phaseDropoffRate: number; // 단계별 이탈률 (1차→2차 진행 시 이탈 비율)
}

export interface CrewAllStatsResponse extends CrewBasicStats {
  memberGrowth: MemberGrowthData[];
  memberStats: MemberAttendanceStat[];
  popularGyms: GymStat[];
  dayDistribution: DayDistributionData[];
  timeDistribution: TimeDistributionData[];
  // 추가 통계
  dayAttendanceRate: DayAttendanceRateData[];
  timeAttendanceRate: TimeAttendanceRateData[];
  gymAttendanceRate: GymAttendanceRateData[];
  recentActivities: Array<
    ActivityLog & {
      user: Pick<Profile, "id" | "full_name" | "nickname" | "avatar_url">;
    }
  >;
}

/**
 * 크루 기본 통계 조회
 */
export async function getCrewBasicStats(crewId: string): Promise<CrewBasicStats> {
  const supabase = await createClient();

  // 1. 크루 정보
  const { data: crew, error: crewError } = await supabase
    .from("crews")
    .select("*")
    .eq("id", crewId)
    .single();

  if (crewError) {
    throw new Error(`Failed to fetch crew: ${crewError.message}`);
  }

  // 2. 전체 멤버 수 (활성 멤버만)
  const { count: totalMembers } = await supabase
    .from("crew_members")
    .select("*", { count: "exact", head: true })
    .eq("crew_id", crewId)
    .eq("is_active", true);

  // 3. 전체 일정 수
  const { count: totalSchedules } = await supabase
    .from("schedules")
    .select("*", { count: "exact", head: true })
    .eq("crew_id", crewId);

  // 4. 완료된 일정 수 (과거 일정)
  const { count: completedSchedules } = await supabase
    .from("schedules")
    .select("*", { count: "exact", head: true })
    .eq("crew_id", crewId)
    .lt("event_date", new Date().toISOString());

  // 5. 다가오는 일정 수
  const { count: upcomingSchedules } = await supabase
    .from("schedules")
    .select("*", { count: "exact", head: true })
    .eq("crew_id", crewId)
    .gte("event_date", new Date().toISOString());

  // 6. 전체 참석 기록 수
  const { count: totalAttendances } = await supabase
    .from("schedule_attendances")
    .select("*, schedules!inner(crew_id)", { count: "exact", head: true })
    .eq("schedules.crew_id", crewId);

  // 7. 체크인 완료 수
  const { count: checkedInCount } = await supabase
    .from("schedule_attendances")
    .select("*, schedules!inner(crew_id)", { count: "exact", head: true })
    .eq("schedules.crew_id", crewId)
    .not("checked_in_at", "is", null);

  // 8. 출석률 계산
  const attendanceRate =
    totalAttendances && totalAttendances > 0 ? (checkedInCount! / totalAttendances) * 100 : 0;

  // 9. 일정당 평균 참석자 수
  const { data: schedulesWithAttendances } = await supabase
    .from("schedules")
    .select(
      `
      id,
      attendances:schedule_attendances(id, checked_in_at)
    `,
    )
    .eq("crew_id", crewId);

  const totalCheckedIn =
    schedulesWithAttendances?.reduce((sum, schedule) => {
      const attendances = schedule.attendances as Array<{
        id: string;
        checked_in_at: string | null;
      }>;
      return sum + attendances.filter((a) => a.checked_in_at).length;
    }, 0) || 0;
  const averageAttendees =
    completedSchedules && completedSchedules > 0 ? totalCheckedIn / completedSchedules : 0;

  // 10. 노쇼율
  const { count: noShowCount } = await supabase
    .from("schedule_attendances")
    .select("*, schedules!inner(crew_id)", { count: "exact", head: true })
    .eq("schedules.crew_id", crewId)
    .eq("status", "no_show");
  const noShowRate =
    totalAttendances && totalAttendances > 0 ? (noShowCount! / totalAttendances) * 100 : 0;

  // 11. 신규 멤버 전환율 (최근 3개월 가입자 중 첫 참석까지의 비율)
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const { data: newMembers } = await supabase
    .from("crew_members")
    .select("user_id, joined_at")
    .eq("crew_id", crewId)
    .gte("joined_at", threeMonthsAgo.toISOString());

  let newMembersWithAttendance = 0;
  if (newMembers && newMembers.length > 0) {
    for (const member of newMembers) {
      const { count: attendanceCount } = await supabase
        .from("schedule_attendances")
        .select("*, schedules!inner(crew_id)", { count: "exact", head: true })
        .eq("user_id", member.user_id)
        .eq("schedules.crew_id", crewId)
        .not("checked_in_at", "is", null);
      if (attendanceCount && attendanceCount > 0) {
        newMembersWithAttendance++;
      }
    }
  }
  const newMemberConversionRate =
    newMembers && newMembers.length > 0 ? (newMembersWithAttendance / newMembers.length) * 100 : 0;

  // 12. 단계별 이탈률 (1차 참석자 중 2차에 참석한 비율의 역)
  const { data: phaseAttendances } = await supabase
    .from("schedule_attendances")
    .select(
      `
      user_id,
      schedule_id,
      phase_id,
      checked_in_at,
      phase:schedule_phases(phase_number),
      schedule:schedules!inner(crew_id)
    `,
    )
    .eq("schedule.crew_id", crewId)
    .not("checked_in_at", "is", null);

  // 일정별로 그룹화하여 1차, 2차 참석 계산
  const schedulePhaseMap = new Map<string, { phase1: Set<string>; phase2: Set<string> }>();
  phaseAttendances?.forEach((attendance) => {
    const phase = attendance.phase as { phase_number: number } | null;
    if (!phase) return;

    if (!schedulePhaseMap.has(attendance.schedule_id)) {
      schedulePhaseMap.set(attendance.schedule_id, {
        phase1: new Set(),
        phase2: new Set(),
      });
    }

    const map = schedulePhaseMap.get(attendance.schedule_id)!;
    if (phase.phase_number === 1) {
      map.phase1.add(attendance.user_id);
    } else if (phase.phase_number === 2) {
      map.phase2.add(attendance.user_id);
    }
  });

  let totalPhase1 = 0;
  let continuedToPhase2 = 0;
  schedulePhaseMap.forEach((phases) => {
    totalPhase1 += phases.phase1.size;
    phases.phase1.forEach((userId) => {
      if (phases.phase2.has(userId)) {
        continuedToPhase2++;
      }
    });
  });

  const phaseDropoffRate =
    totalPhase1 > 0 ? ((totalPhase1 - continuedToPhase2) / totalPhase1) * 100 : 0;

  return {
    crew,
    totalMembers: totalMembers || 0,
    totalSchedules: totalSchedules || 0,
    completedSchedules: completedSchedules || 0,
    upcomingSchedules: upcomingSchedules || 0,
    totalAttendances: totalAttendances || 0,
    checkedInCount: checkedInCount || 0,
    attendanceRate: Math.round(attendanceRate * 10) / 10,
    averageAttendees: Math.round(averageAttendees * 10) / 10,
    noShowRate: Math.round(noShowRate * 10) / 10,
    newMemberConversionRate: Math.round(newMemberConversionRate * 10) / 10,
    phaseDropoffRate: Math.round(phaseDropoffRate * 10) / 10,
  };
}

/**
 * 멤버 성장 추이 (월별)
 */
export async function getMemberGrowth(
  crewId: string,
  months: number = 6,
): Promise<{ growth: MemberGrowthData[] }> {
  const supabase = await createClient();

  // 최근 N개월 데이터
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const { data: members, error } = await supabase
    .from("crew_members")
    .select("joined_at")
    .eq("crew_id", crewId)
    .eq("is_active", true)
    .gte("joined_at", startDate.toISOString())
    .order("joined_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch member growth: ${error.message}`);
  }

  // 월별로 그룹화
  const monthlyData: { [key: string]: number } = {};

  // 최근 N개월 초기화
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthlyData[key] = 0;
  }

  // 데이터 카운트
  members.forEach((member) => {
    if (member.joined_at) {
      const date = new Date(member.joined_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyData[key] !== undefined) {
        monthlyData[key]++;
      }
    }
  });

  // 누적 합계로 변환
  let cumulative = 0;
  const growth = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => {
      cumulative += count;
      return {
        month,
        count: cumulative,
        newMembers: count,
      };
    });

  return { growth };
}

/**
 * 멤버별 참석 통계
 */
export async function getMemberAttendanceStats(
  crewId: string,
  limit: number = 20,
): Promise<{ memberStats: MemberAttendanceStat[] }> {
  const supabase = await createClient();

  const { data: attendances, error } = await supabase
    .from("schedule_attendances")
    .select(
      `
      *,
      schedules!inner(crew_id, event_date),
      user:profiles(id, full_name, nickname, avatar_url)
    `,
    )
    .eq("schedules.crew_id", crewId)
    .order("checked_in_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch attendance stats: ${error.message}`);
  }

  // 멤버별로 그룹화
  const memberStats = new Map<string, MemberAttendanceStat>();

  attendances.forEach((attendance) => {
    const userId = attendance.user_id;
    if (!memberStats.has(userId)) {
      memberStats.set(userId, {
        user: attendance.user,
        totalSchedules: 0,
        attended: 0,
        attendanceRate: 0,
      });
    }

    const stats = memberStats.get(userId)!;
    stats.totalSchedules++;
    if (attendance.checked_in_at) {
      stats.attended++;
    }
  });

  // 출석률 계산 및 정렬
  const sortedStats = Array.from(memberStats.values())
    .map((stat) => ({
      ...stat,
      attendanceRate: stat.totalSchedules > 0 ? (stat.attended / stat.totalSchedules) * 100 : 0,
    }))
    .sort((a, b) => b.attended - a.attended)
    .slice(0, limit);

  return { memberStats: sortedStats };
}

/**
 * 인기 암장 통계
 */
export async function getPopularGyms(
  crewId: string,
  limit: number = 10,
): Promise<{ topGyms: GymStat[] }> {
  const supabase = await createClient();

  // schedule_phases에서 gym_id를 조회
  const { data: phases, error } = await supabase
    .from("schedule_phases")
    .select(
      `
      gym_id,
      gyms(id, name, address),
      schedules!inner(crew_id)
    `,
    )
    .eq("schedules.crew_id", crewId)
    .not("gym_id", "is", null);

  if (error) {
    throw new Error(`Failed to fetch gym stats: ${error.message}`);
  }

  // 암장별로 카운트
  const gymCounts = new Map<string, GymStat>();

  phases.forEach((phase) => {
    if (phase.gyms && typeof phase.gyms === "object" && !Array.isArray(phase.gyms)) {
      const gym = phase.gyms as { id: string; name: string; address: string | null };
      const gymId = phase.gym_id!;
      if (!gymCounts.has(gymId)) {
        gymCounts.set(gymId, {
          gym: {
            id: gym.id,
            name: gym.name,
            address: gym.address,
            location: gym.address, // address를 location으로 사용
          },
          count: 0,
        });
      }
      gymCounts.get(gymId)!.count++;
    }
  });

  const topGyms = Array.from(gymCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  return { topGyms };
}

/**
 * 요일별 일정 분포
 */
export async function getDayDistribution(
  crewId: string,
): Promise<{ distribution: DayDistributionData[] }> {
  const supabase = await createClient();

  const { data: schedules, error } = await supabase
    .from("schedules")
    .select("event_date")
    .eq("crew_id", crewId);

  if (error || !schedules) {
    throw new Error(`Failed to fetch day distribution: ${error?.message || "No data"}`);
  }

  // 요일별 카운트 (0: 일요일, 6: 토요일)
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];

  schedules.forEach((schedule) => {
    const day = new Date(schedule.event_date).getDay();
    dayCounts[day]++;
  });

  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const distribution = dayCounts.map((count, index) => ({
    day: dayNames[index],
    dayOfWeek: index,
    count,
  }));

  return { distribution };
}

/**
 * 시간대별 일정 분포
 */
export async function getTimeDistribution(
  crewId: string,
): Promise<{ distribution: TimeDistributionData[] }> {
  const supabase = await createClient();

  const { data: schedules, error } = await supabase
    .from("schedules")
    .select("event_date")
    .eq("crew_id", crewId);

  if (error || !schedules) {
    throw new Error(`Failed to fetch time distribution: ${error?.message || "No data"}`);
  }

  // 시간대별 카운트 (8-11: 오전, 12-17: 오후, 18-23: 저녁)
  const timeSlots = {
    morning: 0, // 8-11시
    afternoon: 0, // 12-17시
    evening: 0, // 18-23시
  };

  schedules.forEach((schedule) => {
    const hour = new Date(schedule.event_date).getHours();
    if (hour >= 8 && hour < 12) timeSlots.morning++;
    else if (hour >= 12 && hour < 18) timeSlots.afternoon++;
    else if (hour >= 18 && hour <= 23) timeSlots.evening++;
  });

  return {
    distribution: [
      { timeSlot: "오전 (8-12시)", count: timeSlots.morning },
      { timeSlot: "오후 (12-18시)", count: timeSlots.afternoon },
      { timeSlot: "저녁 (18-00시)", count: timeSlots.evening },
    ],
  };
}

/**
 * 최근 활동 로그
 */
export async function getRecentActivities(
  crewId: string,
  limit: number = 10,
): Promise<{
  activities: Array<
    ActivityLog & {
      user: Pick<Profile, "id" | "full_name" | "nickname" | "avatar_url">;
    }
  >;
}> {
  const supabase = await createClient();

  const { data: activities, error } = await supabase
    .from("activity_logs")
    .select(
      `
      *,
      user:profiles(id, full_name, nickname, avatar_url)
    `,
    )
    .eq("crew_id", crewId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch activities: ${error.message}`);
  }

  return { activities };
}

/**
 * 요일별 참석률
 */
export async function getDayAttendanceRate(
  crewId: string,
): Promise<{ dayAttendanceRate: DayAttendanceRateData[] }> {
  const supabase = await createClient();

  const { data: schedules } = await supabase
    .from("schedules")
    .select(
      `
      id,
      event_date,
      attendances:schedule_attendances(id, checked_in_at)
    `,
    )
    .eq("crew_id", crewId);

  const dayStats: { [key: number]: { total: number; attended: number } } = {};
  for (let i = 0; i < 7; i++) {
    dayStats[i] = { total: 0, attended: 0 };
  }

  schedules?.forEach((schedule) => {
    const day = new Date(schedule.event_date).getDay();
    const attendances = schedule.attendances as Array<{
      id: string;
      checked_in_at: string | null;
    }>;
    dayStats[day].total += attendances.length;
    dayStats[day].attended += attendances.filter((a) => a.checked_in_at).length;
  });

  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const dayAttendanceRate: DayAttendanceRateData[] = Object.entries(dayStats).map(
    ([dayOfWeek, stats]) => ({
      day: dayNames[Number(dayOfWeek)],
      dayOfWeek: Number(dayOfWeek),
      totalSchedules: stats.total,
      totalAttended: stats.attended,
      attendanceRate: stats.total > 0 ? (stats.attended / stats.total) * 100 : 0,
    }),
  );

  return { dayAttendanceRate };
}

/**
 * 시간대별 참석률
 */
export async function getTimeAttendanceRate(
  crewId: string,
): Promise<{ timeAttendanceRate: TimeAttendanceRateData[] }> {
  const supabase = await createClient();

  const { data: schedules } = await supabase
    .from("schedules")
    .select(
      `
      id,
      phases:schedule_phases(start_time),
      attendances:schedule_attendances(id, checked_in_at)
    `,
    )
    .eq("crew_id", crewId);

  const timeStats: {
    [key: string]: { total: number; attended: number };
  } = {
    "오전 (8-12시)": { total: 0, attended: 0 },
    "오후 (12-18시)": { total: 0, attended: 0 },
    "저녁 (18-00시)": { total: 0, attended: 0 },
  };

  schedules?.forEach((schedule) => {
    const phases = schedule.phases as Array<{ start_time: string }>;
    const startTime = phases[0]?.start_time;
    if (!startTime) return;

    const hour = parseInt(startTime.split(":")[0]);
    let timeSlot: string;
    if (hour >= 8 && hour < 12) timeSlot = "오전 (8-12시)";
    else if (hour >= 12 && hour < 18) timeSlot = "오후 (12-18시)";
    else if (hour >= 18 && hour <= 23) timeSlot = "저녁 (18-00시)";
    else return; // 해당되지 않는 시간대는 무시

    const attendances = schedule.attendances as Array<{
      id: string;
      checked_in_at: string | null;
    }>;
    timeStats[timeSlot].total += attendances.length;
    timeStats[timeSlot].attended += attendances.filter((a) => a.checked_in_at).length;
  });

  const timeAttendanceRate: TimeAttendanceRateData[] = Object.entries(timeStats).map(
    ([timeSlot, stats]) => ({
      timeSlot,
      totalSchedules: stats.total,
      totalAttended: stats.attended,
      attendanceRate: stats.total > 0 ? (stats.attended / stats.total) * 100 : 0,
    }),
  );

  return { timeAttendanceRate };
}

/**
 * 암장별 참석률
 */
export async function getGymAttendanceRate(
  crewId: string,
  limit: number = 10,
): Promise<{ gymAttendanceRate: GymAttendanceRateData[] }> {
  const supabase = await createClient();

  const { data: phases } = await supabase
    .from("schedule_phases")
    .select(
      `
      gym_id,
      gym:gyms(id, name, address),
      schedule_id,
      schedules!inner(crew_id)
    `,
    )
    .eq("schedules.crew_id", crewId)
    .not("gym_id", "is", null);

  if (!phases) {
    return { gymAttendanceRate: [] };
  }

  const gymStatsMap = new Map<
    string,
    { gym: { id: string; name: string; address: string | null }; total: number; attended: number }
  >();

  for (const phase of phases) {
    if (!phase.gym || !phase.gym_id) continue;

    const gym = phase.gym as { id: string; name: string; address: string | null };

    const { data: attendances } = await supabase
      .from("schedule_attendances")
      .select("id, checked_in_at")
      .eq("schedule_id", phase.schedule_id)
      .eq("phase_id", phase.gym_id);

    if (!attendances) continue;

    const total = attendances.length;
    const attended = attendances.filter((a) => a.checked_in_at).length;

    if (gymStatsMap.has(phase.gym_id)) {
      const existing = gymStatsMap.get(phase.gym_id)!;
      existing.total += total;
      existing.attended += attended;
    } else {
      gymStatsMap.set(phase.gym_id, {
        gym: { id: gym.id, name: gym.name, address: gym.address },
        total,
        attended,
      });
    }
  }

  const gymAttendanceRate: GymAttendanceRateData[] = Array.from(gymStatsMap.values())
    .map((stat) => ({
      gym: stat.gym,
      totalSchedules: stat.total,
      totalAttended: stat.attended,
      attendanceRate: stat.total > 0 ? (stat.attended / stat.total) * 100 : 0,
    }))
    .sort((a, b) => b.totalSchedules - a.totalSchedules)
    .slice(0, limit);

  return { gymAttendanceRate };
}

/**
 * 크루 전체 통계 (모든 통계를 한번에)
 */
export async function getCrewAllStats(crewId: string): Promise<CrewAllStatsResponse> {
  const [
    basicStats,
    memberGrowth,
    memberStats,
    popularGyms,
    dayDist,
    timeDist,
    dayAttendRate,
    timeAttendRate,
    gymAttendRate,
    recentActivities,
  ] = await Promise.all([
    getCrewBasicStats(crewId),
    getMemberGrowth(crewId),
    getMemberAttendanceStats(crewId),
    getPopularGyms(crewId),
    getDayDistribution(crewId),
    getTimeDistribution(crewId),
    getDayAttendanceRate(crewId),
    getTimeAttendanceRate(crewId),
    getGymAttendanceRate(crewId),
    getRecentActivities(crewId),
  ]);

  return {
    ...basicStats,
    memberGrowth: memberGrowth.growth,
    memberStats: memberStats.memberStats,
    popularGyms: popularGyms.topGyms,
    dayDistribution: dayDist.distribution,
    timeDistribution: timeDist.distribution,
    dayAttendanceRate: dayAttendRate.dayAttendanceRate,
    timeAttendanceRate: timeAttendRate.timeAttendanceRate,
    gymAttendanceRate: gymAttendRate.gymAttendanceRate,
    recentActivities: recentActivities.activities,
  };
}
