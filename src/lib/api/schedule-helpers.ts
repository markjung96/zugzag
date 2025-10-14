/**
 * 일정(스케줄) 관리 API Helper 함수
 * 서버 컴포넌트 및 API 라우트에서 사용
 */

import type { Tables } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

// 타입 정의
type Schedule = Tables<"schedules">;
type SchedulePhase = Tables<"schedule_phases">;
type ScheduleAttendance = Tables<"schedule_attendances">;
type Profile = Tables<"profiles">;
type Crew = Tables<"crews">;
type Gym = Tables<"gyms">;
type ScheduleStats = Tables<"schedule_stats">;

export interface PhaseInput {
  phase_number: number;
  title: string;
  start_time: string;
  end_time?: string | null;
  gym_id?: string | null;
  location_text?: string | null;
  capacity?: number;
  notes?: string;
}

export interface CreateScheduleData {
  crew_id: string | null;
  created_by: string;
  title: string;
  description?: string;
  event_date: string;
  total_capacity: number;
  is_public?: boolean;
  visibility?: "crew" | "link" | "public";
  rsvp_deadline?: string;
  allow_waitlist?: boolean;
  reminder_hours?: number[];
  tags?: string[];
  notes?: string;
  phases: PhaseInput[];
}

export interface UpdateScheduleData {
  title?: string;
  description?: string;
  event_date?: string;
  total_capacity?: number;
  is_public?: boolean;
  visibility?: string;
  rsvp_deadline?: string;
  allow_waitlist?: boolean;
  tags?: string[];
  notes?: string;
}

export interface PhaseWithGym {
  id: string;
  schedule_id: string;
  phase_number: number;
  title: string;
  start_time: string;
  end_time: string | null;
  gym_id: string | null;
  location_text: string | null;
  capacity: number | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  gym: Pick<Gym, "id" | "name" | "address"> | null;
}

export interface ScheduleWithRelations extends Schedule {
  crew: Pick<Crew, "id" | "name" | "logo_url"> | null;
  creator: Pick<Profile, "id" | "full_name" | "avatar_url"> | null;
  phases: PhaseWithGym[];
}

export interface SchedulesResponse {
  schedules: ScheduleWithRelations[];
  total: number;
}

export interface AttendanceWithUser {
  id: string;
  schedule_id: string;
  user_id: string;
  phase_id: string | null;
  status: string;
  checked_in_at: string | null;
  checked_out_at: string | null;
  user_note: string | null;
  admin_note: string | null;
  created_at: string | null;
  updated_at: string | null;
  user: Pick<Profile, "id" | "full_name" | "avatar_url" | "nickname">;
}

export interface PhaseWithGymDetail {
  id: string;
  schedule_id: string;
  phase_number: number;
  title: string;
  start_time: string;
  end_time: string | null;
  gym_id: string | null;
  location_text: string | null;
  capacity: number | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  gym: Pick<Gym, "id" | "name" | "address" | "phone" | "website" | "latitude" | "longitude"> | null;
}

export interface ScheduleDetail extends Schedule {
  crew: Pick<Crew, "id" | "name" | "logo_url" | "description"> | null;
  creator: Pick<Profile, "id" | "full_name" | "avatar_url" | "nickname"> | null;
  phases: PhaseWithGymDetail[];
  attendances: AttendanceWithUser[];
}

export interface ScheduleDetailResponse {
  schedule: ScheduleDetail;
}

export interface AttendanceWithUserAndPhase extends ScheduleAttendance {
  user: Pick<Profile, "id" | "full_name" | "avatar_url" | "nickname" | "climbing_level">;
  phase: Pick<SchedulePhase, "id" | "phase_number" | "title"> | null;
}

export interface AttendancesResponse {
  attendances: AttendanceWithUserAndPhase[];
}

export interface SuccessResponse {
  success: true;
}

export interface ScheduleStatsResponse {
  stats: ScheduleStats;
}

/**
 * 일정 생성
 */
export async function createSchedule(data: CreateScheduleData): Promise<{ schedule: Schedule }> {
  const supabase = await createClient();

  // 1. 일정 생성
  const { data: schedule, error: scheduleError } = await supabase
    .from("schedules")
    .insert({
      crew_id: data.crew_id,
      created_by: data.created_by,
      title: data.title,
      description: data.description,
      event_date: data.event_date,
      total_capacity: data.total_capacity,
      is_public: data.is_public ?? false,
      visibility: data.visibility ?? "crew",
      rsvp_deadline: data.rsvp_deadline,
      allow_waitlist: data.allow_waitlist ?? true,
      reminder_hours: data.reminder_hours ?? [24, 2],
      tags: data.tags ?? [],
      notes: data.notes,
    })
    .select()
    .single();

  if (scheduleError) {
    throw new Error(`Failed to create schedule: ${scheduleError.message}`);
  }

  // 2. 단계(phases) 생성
  if (data.phases && data.phases.length > 0) {
    const phasesData = data.phases.map((phase) => ({
      schedule_id: schedule.id,
      phase_number: phase.phase_number,
      title: phase.title,
      start_time: phase.start_time,
      end_time: phase.end_time,
      gym_id: phase.gym_id,
      location_text: phase.location_text,
      capacity: phase.capacity,
      notes: phase.notes,
    }));

    const { error: phasesError } = await supabase.from("schedule_phases").insert(phasesData);

    if (phasesError) {
      // 일정 롤백 (수동)
      await supabase.from("schedules").delete().eq("id", schedule.id);
      throw new Error(`Failed to create schedule phases: ${phasesError.message}`);
    }
  }

  return { schedule };
}

/**
 * 일정 목록 조회
 */
export async function getSchedules(params: {
  crew_id?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
  status?: "upcoming" | "past" | "all";
  limit?: number;
  offset?: number;
}): Promise<SchedulesResponse> {
  const supabase = await createClient();
  const {
    crew_id,
    user_id: _user_id,
    start_date,
    end_date,
    status = "upcoming",
    limit = 50,
    offset = 0,
  } = params;

  let query = supabase
    .from("schedules")
    .select(
      `
      *,
      crew:crews(id, name, logo_url),
      creator:profiles!schedules_created_by_fkey(id, full_name, avatar_url),
      phases:schedule_phases(
        id, schedule_id, phase_number, title, start_time, end_time, gym_id,
        gym:gyms(id, name, address),
        location_text, capacity, notes, created_at, updated_at
      )
    `,
    )
    .eq("is_cancelled", false)
    .order("event_date", { ascending: status === "past" ? false : true })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  // 크루 필터
  if (crew_id) {
    query = query.eq("crew_id", crew_id);
  }

  // 날짜 범위 필터
  if (status === "upcoming") {
    query = query.gte("event_date", new Date().toISOString().split("T")[0]);
  } else if (status === "past") {
    query = query.lt("event_date", new Date().toISOString().split("T")[0]);
  }

  if (start_date) {
    query = query.gte("event_date", start_date);
  }

  if (end_date) {
    query = query.lte("event_date", end_date);
  }

  const { data: schedules, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch schedules: ${error.message}`);
  }

  // 총 개수 조회
  let countQuery = supabase
    .from("schedules")
    .select("*", { count: "exact", head: true })
    .eq("is_cancelled", false);

  if (crew_id) {
    countQuery = countQuery.eq("crew_id", crew_id);
  }

  if (status === "upcoming") {
    countQuery = countQuery.gte("event_date", new Date().toISOString().split("T")[0]);
  } else if (status === "past") {
    countQuery = countQuery.lt("event_date", new Date().toISOString().split("T")[0]);
  }

  const { count } = await countQuery;

  return { schedules, total: count || 0 };
}

/**
 * 일정 상세 조회
 */
export async function getScheduleById(id: string): Promise<ScheduleDetailResponse> {
  const supabase = await createClient();

  const { data: schedule, error } = await supabase
    .from("schedules")
    .select(
      `
      *,
      crew:crews(id, name, logo_url, description),
      creator:profiles!schedules_created_by_fkey(id, full_name, avatar_url, nickname),
      phases:schedule_phases(
        id, schedule_id, phase_number, title, start_time, end_time, gym_id,
        gym:gyms(id, name, address, phone, website, latitude, longitude),
        location_text, capacity, notes, created_at, updated_at
      ),
      attendances:schedule_attendances(
        id, schedule_id, user_id, phase_id, status, checked_in_at, checked_out_at, 
        user_note, admin_note, created_at, updated_at,
        user:profiles(id, full_name, avatar_url, nickname)
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch schedule: ${error.message}`);
  }

  return { schedule };
}

/**
 * 일정 수정
 */
export async function updateSchedule(
  id: string,
  updates: UpdateScheduleData,
): Promise<{ schedule: Schedule }> {
  const supabase = await createClient();

  const { data: schedule, error } = await supabase
    .from("schedules")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update schedule: ${error.message}`);
  }

  return { schedule };
}

/**
 * 일정 취소
 */
export async function cancelSchedule(
  id: string,
  reason?: string,
  cancelled_by?: string,
): Promise<{ schedule: Schedule }> {
  const supabase = await createClient();

  const { data: schedule, error } = await supabase
    .from("schedules")
    .update({
      is_cancelled: true,
      cancelled_at: new Date().toISOString(),
      cancelled_by,
      cancelled_reason: reason,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to cancel schedule: ${error.message}`);
  }

  return { schedule };
}

/**
 * 일정 삭제
 */
export async function deleteSchedule(id: string): Promise<SuccessResponse> {
  const supabase = await createClient();

  const { error } = await supabase.from("schedules").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete schedule: ${error.message}`);
  }

  return { success: true };
}

/**
 * 참석 등록
 */
export async function registerAttendance(data: {
  schedule_id: string;
  user_id: string;
  phase_id?: string;
  user_note?: string;
}): Promise<{ success: boolean; attendance_id?: string }> {
  const supabase = await createClient();

  const { data: result, error } = await supabase.rpc("register_schedule_attendance", {
    p_schedule_id: data.schedule_id,
    p_user_id: data.user_id,
    p_phase_id: data.phase_id || undefined,
    p_user_note: data.user_note || undefined,
  });

  if (error) {
    throw new Error(`Failed to register attendance: ${error.message}`);
  }

  return { success: true, attendance_id: result as string };
}

/**
 * 참석 상태 변경
 */
export async function updateAttendanceStatus(
  attendance_id: string,
  status: "attending" | "not_attending" | "maybe" | "waitlist" | "late" | "early_leave" | "no_show",
  user_note?: string,
): Promise<{ attendance: ScheduleAttendance }> {
  const supabase = await createClient();

  const { data: attendance, error } = await supabase
    .from("schedule_attendances")
    .update({
      status,
      user_note,
    })
    .eq("id", attendance_id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update attendance status: ${error.message}`);
  }

  return { attendance };
}

/**
 * 체크인
 */
export async function checkInAttendance(
  attendance_id: string,
): Promise<{ attendance: ScheduleAttendance }> {
  const supabase = await createClient();

  const { data: attendance, error } = await supabase
    .from("schedule_attendances")
    .update({
      checked_in_at: new Date().toISOString(),
      status: "attending",
    })
    .eq("id", attendance_id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to check in: ${error.message}`);
  }

  return { attendance };
}

/**
 * 체크아웃
 */
export async function checkOutAttendance(
  attendance_id: string,
): Promise<{ attendance: ScheduleAttendance }> {
  const supabase = await createClient();

  const { data: attendance, error } = await supabase
    .from("schedule_attendances")
    .update({
      checked_out_at: new Date().toISOString(),
    })
    .eq("id", attendance_id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to check out: ${error.message}`);
  }

  return { attendance };
}

/**
 * 참석자 목록 조회
 */
export async function getScheduleAttendances(
  schedule_id: string,
  status?: string,
): Promise<AttendancesResponse> {
  const supabase = await createClient();

  let query = supabase
    .from("schedule_attendances")
    .select(
      `
      *,
      user:profiles(id, full_name, avatar_url, nickname, climbing_level),
      phase:schedule_phases(id, phase_number, title)
    `,
    )
    .eq("schedule_id", schedule_id)
    .order("created_at", { ascending: true });

  if (status) {
    query = query.eq("status", status);
  }

  const { data: attendances, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch attendances: ${error.message}`);
  }

  return { attendances };
}

/**
 * 대기열 승격
 */
export async function promoteFromWaitlist(schedule_id: string): Promise<SuccessResponse> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("promote_from_waitlist", {
    p_schedule_id: schedule_id,
  });

  if (error) {
    throw new Error(`Failed to promote from waitlist: ${error.message}`);
  }

  return { success: true };
}

/**
 * 일정 통계 조회
 */
export async function getScheduleStats(schedule_id: string): Promise<ScheduleStatsResponse> {
  const supabase = await createClient();

  const { data: stats, error } = await supabase
    .from("schedule_stats")
    .select("*")
    .eq("schedule_id", schedule_id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch schedule stats: ${error.message}`);
  }

  return { stats };
}
