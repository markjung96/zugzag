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

export interface CrewBasicStats {
  crew: Crew;
  totalMembers: number;
  totalSchedules: number;
  completedSchedules: number;
  upcomingSchedules: number;
  totalAttendances: number;
  checkedInCount: number;
  attendanceRate: number;
}

export interface CrewAllStatsResponse extends CrewBasicStats {
  memberGrowth: MemberGrowthData[];
  memberStats: MemberAttendanceStat[];
  popularGyms: GymStat[];
  dayDistribution: DayDistributionData[];
  timeDistribution: TimeDistributionData[];
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

  return {
    crew,
    totalMembers: totalMembers || 0,
    totalSchedules: totalSchedules || 0,
    completedSchedules: completedSchedules || 0,
    upcomingSchedules: upcomingSchedules || 0,
    totalAttendances: totalAttendances || 0,
    checkedInCount: checkedInCount || 0,
    attendanceRate: Math.round(attendanceRate * 10) / 10,
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

  // 시간대별 카운트 (0-5: 새벽, 6-11: 오전, 12-17: 오후, 18-23: 저녁)
  const timeSlots = {
    dawn: 0, // 0-5시
    morning: 0, // 6-11시
    afternoon: 0, // 12-17시
    evening: 0, // 18-23시
  };

  schedules.forEach((schedule) => {
    const hour = new Date(schedule.event_date).getHours();
    if (hour >= 0 && hour < 6) timeSlots.dawn++;
    else if (hour >= 6 && hour < 12) timeSlots.morning++;
    else if (hour >= 12 && hour < 18) timeSlots.afternoon++;
    else timeSlots.evening++;
  });

  return {
    distribution: [
      { timeSlot: "새벽 (0-5시)", count: timeSlots.dawn },
      { timeSlot: "오전 (6-11시)", count: timeSlots.morning },
      { timeSlot: "오후 (12-17시)", count: timeSlots.afternoon },
      { timeSlot: "저녁 (18-23시)", count: timeSlots.evening },
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
 * 크루 전체 통계 (모든 통계를 한번에)
 */
export async function getCrewAllStats(crewId: string): Promise<CrewAllStatsResponse> {
  const [basicStats, memberGrowth, memberStats, popularGyms, dayDist, timeDist, recentActivities] =
    await Promise.all([
      getCrewBasicStats(crewId),
      getMemberGrowth(crewId),
      getMemberAttendanceStats(crewId),
      getPopularGyms(crewId),
      getDayDistribution(crewId),
      getTimeDistribution(crewId),
      getRecentActivities(crewId),
    ]);

  return {
    ...basicStats,
    memberGrowth: memberGrowth.growth,
    memberStats: memberStats.memberStats,
    popularGyms: popularGyms.topGyms,
    dayDistribution: dayDist.distribution,
    timeDistribution: timeDist.distribution,
    recentActivities: recentActivities.activities,
  };
}
