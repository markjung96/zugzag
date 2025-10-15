/**
 * 일정(스케줄) 관리 API Helper 함수
 * 서버 컴포넌트 및 API 라우트에서 사용
 */

import type { Database, Tables } from "@/lib/supabase/database.types";
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
  // 활동 타입
  phase_type?: "exercise" | "meal" | "afterparty";
  exercise_type?: "climbing" | "gym" | "running" | "hiking" | "other";
  // 암장 정보 (운동일 때)
  gym_id?: string | null;
  location_text?: string | null;
  // 카카오 장소 정보 (식사/뒷풀이일 때)
  location_kakao_id?: string | null;
  location_kakao_name?: string | null;
  location_kakao_address?: string | null;
  location_kakao_category?: string | null;
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
  phase_type: "exercise" | "meal" | "afterparty";
  exercise_type: "climbing" | "gym" | "running" | "hiking" | "other" | null;
  gym_id: string | null;
  location_text: string | null;
  location_kakao_id: string | null;
  location_kakao_name: string | null;
  location_kakao_address: string | null;
  location_kakao_category: string | null;
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
  phase_type: "exercise" | "meal" | "afterparty";
  exercise_type: "climbing" | "gym" | "running" | "hiking" | "other" | null;
  gym_id: string | null;
  location_text: string | null;
  location_kakao_id: string | null;
  location_kakao_name: string | null;
  location_kakao_address: string | null;
  location_kakao_category: string | null;
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
      phase_type: phase.phase_type || "exercise",
      exercise_type: phase.exercise_type || "climbing",
      gym_id: phase.gym_id,
      location_text: phase.location_text,
      location_kakao_id: phase.location_kakao_id,
      location_kakao_name: phase.location_kakao_name,
      location_kakao_address: phase.location_kakao_address,
      location_kakao_category: phase.location_kakao_category,
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
        id, schedule_id, phase_number, title, start_time, end_time, 
        phase_type, exercise_type, gym_id,
        gym:gyms(id, name, address),
        location_text, location_kakao_id, location_kakao_name, 
        location_kakao_address, location_kakao_category,
        capacity, notes, created_at, updated_at
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
        id, schedule_id, phase_number, title, start_time, end_time, 
        phase_type, exercise_type, gym_id,
        gym:gyms(id, name, address, phone, website, latitude, longitude),
        location_text, location_kakao_id, location_kakao_name,
        location_kakao_address, location_kakao_category,
        capacity, notes, created_at, updated_at
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

  // RSVP 마감 시간 확인
  const { data: schedule } = await supabase
    .from("schedules")
    .select("rsvp_deadline, is_cancelled")
    .eq("id", data.schedule_id)
    .single();

  if (schedule?.is_cancelled) {
    throw new Error("일정이 취소되었습니다");
  }

  if (schedule?.rsvp_deadline) {
    const now = new Date();
    const deadline = new Date(schedule.rsvp_deadline);
    if (now > deadline) {
      throw new Error("RSVP 마감 시간이 지났습니다");
    }
  }

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

  // 참석 정보 조회 후 RSVP 마감 확인
  const { data: currentAttendance } = await supabase
    .from("schedule_attendances")
    .select("schedule_id")
    .eq("id", attendance_id)
    .single();

  if (currentAttendance) {
    const { data: schedule } = await supabase
      .from("schedules")
      .select("rsvp_deadline, is_cancelled")
      .eq("id", currentAttendance.schedule_id)
      .single();

    if (schedule?.is_cancelled) {
      throw new Error("일정이 취소되었습니다");
    }

    if (schedule?.rsvp_deadline) {
      const now = new Date();
      const deadline = new Date(schedule.rsvp_deadline);
      if (now > deadline) {
        throw new Error("RSVP 마감 시간이 지났습니다");
      }
    }
  }

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
 * 관리자가 참석 상태 변경 (admin_note 포함)
 */
export async function updateAttendanceByAdmin(
  attendance_id: string,
  status: "attending" | "not_attending" | "maybe" | "waitlist" | "late" | "early_leave" | "no_show",
  admin_note?: string,
): Promise<{ attendance: ScheduleAttendance }> {
  const supabase = await createClient();

  const { data: attendance, error } = await supabase
    .from("schedule_attendances")
    .update({
      status,
      admin_note,
    })
    .eq("id", attendance_id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update attendance by admin: ${error.message}`);
  }

  return { attendance };
}

/**
 * 관리자가 체크인 처리 (타임스탬프 포함)
 */
export async function adminCheckIn(
  attendance_id: string,
  admin_note?: string,
): Promise<{ attendance: ScheduleAttendance }> {
  const supabase = await createClient();

  const { data: attendance, error } = await supabase
    .from("schedule_attendances")
    .update({
      checked_in_at: new Date().toISOString(),
      status: "attending",
      admin_note,
    })
    .eq("id", attendance_id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to admin check in: ${error.message}`);
  }

  return { attendance };
}

/**
 * 관리자가 체크아웃 처리
 */
export async function adminCheckOut(
  attendance_id: string,
  admin_note?: string,
): Promise<{ attendance: ScheduleAttendance }> {
  const supabase = await createClient();

  const { data: attendance, error } = await supabase
    .from("schedule_attendances")
    .update({
      checked_out_at: new Date().toISOString(),
      admin_note,
    })
    .eq("id", attendance_id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to admin check out: ${error.message}`);
  }

  return { attendance };
}

/**
 * 특정 대기자를 수동 승격
 */
export async function promoteSpecificWaitlistUser(
  attendance_id: string,
): Promise<{ attendance: ScheduleAttendance }> {
  const supabase = await createClient();

  // 먼저 대기 중인지 확인
  const { data: currentAttendance } = await supabase
    .from("schedule_attendances")
    .select("status, schedule_id")
    .eq("id", attendance_id)
    .single();

  if (!currentAttendance || currentAttendance.status !== "waitlist") {
    throw new Error("Not a waitlist attendance");
  }

  // 정원 확인
  const { data: schedule } = await supabase
    .from("schedules")
    .select("total_capacity")
    .eq("id", currentAttendance.schedule_id)
    .single();

  const { count: currentAttending } = await supabase
    .from("schedule_attendances")
    .select("*", { count: "exact", head: true })
    .eq("schedule_id", currentAttendance.schedule_id)
    .eq("status", "attending");

  if (
    schedule &&
    schedule.total_capacity !== null &&
    currentAttending !== null &&
    currentAttending >= schedule.total_capacity
  ) {
    throw new Error("Schedule is at full capacity");
  }

  // 승격
  const { data: attendance, error } = await supabase
    .from("schedule_attendances")
    .update({
      status: "attending",
      waitlist_position: null,
      waitlist_promoted_at: new Date().toISOString(),
    })
    .eq("id", attendance_id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to promote user: ${error.message}`);
  }

  return { attendance };
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

/**
 * 일정이 종료된 후, 체크인하지 않은 참석자들을 자동으로 노쇼 처리합니다.
 * @param schedule_id - 일정 ID
 * @returns 업데이트된 참석자 수
 */
export async function autoMarkNoShow(schedule_id: string): Promise<{ updated_count: number }> {
  const supabase = await createClient();

  // 1. 일정 정보 가져오기 (모든 단계의 종료 시간 확인)
  const { data: schedule, error: scheduleError } = await supabase
    .from("schedules")
    .select(
      `
      *,
      phases:schedule_phases(*)
    `,
    )
    .eq("id", schedule_id)
    .single();

  if (scheduleError || !schedule) {
    throw new Error(`Failed to fetch schedule: ${scheduleError?.message}`);
  }

  // 2. 마지막 단계의 종료 시간 확인
  const phases = schedule.phases as Database["public"]["Tables"]["schedule_phases"]["Row"][];
  if (!phases || phases.length === 0) {
    throw new Error("Schedule has no phases");
  }

  // 마지막 단계의 종료 시간 (또는 시작 시간 + 3시간)을 기준으로 판단
  const lastPhase = phases[phases.length - 1];
  const lastEndTime = lastPhase.end_time || lastPhase.start_time;

  if (!lastEndTime) {
    throw new Error("Cannot determine schedule end time");
  }

  // 3. 현재 시간이 종료 시간보다 나중인지 확인
  const now = new Date();
  const endDateTime = new Date(`${schedule.event_date}T${lastEndTime}`);

  if (now <= endDateTime) {
    throw new Error("Schedule has not ended yet");
  }

  // 4. attending 상태이지만 체크인하지 않은 참석자들을 no_show로 변경
  const { data: updatedAttendances, error: updateError } = await supabase
    .from("schedule_attendances")
    .update({
      status: "no_show",
      updated_at: new Date().toISOString(),
    })
    .eq("schedule_id", schedule_id)
    .eq("status", "attending")
    .is("checked_in_at", null)
    .select();

  if (updateError) {
    throw new Error(`Failed to mark no-shows: ${updateError.message}`);
  }

  return { updated_count: updatedAttendances?.length || 0 };
}

/**
 * 단계별 RSVP: 특정 단계에 대한 참석 등록/변경
 * @param schedule_id - 일정 ID
 * @param phase_id - 단계 ID (null이면 전체 일정)
 * @param user_id - 사용자 ID
 * @param status - 참석 상태
 * @param user_note - 사용자 메모
 * @returns 참석 정보
 */
export async function registerPhaseAttendance(
  schedule_id: string,
  phase_id: string | null,
  user_id: string,
  status: "attending" | "not_attending" | "maybe",
  user_note?: string,
): Promise<{ attendance: ScheduleAttendance }> {
  const supabase = await createClient();

  // 1. 일정 정보 가져오기
  const { data: schedule, error: scheduleError } = await supabase
    .from("schedules")
    .select("*")
    .eq("id", schedule_id)
    .single();

  if (scheduleError || !schedule) {
    throw new Error(`Failed to fetch schedule: ${scheduleError?.message}`);
  }

  // 2. phase_id가 null이면 전체 일정에 대한 참석 (기존 로직과 동일)
  // phase_id가 있으면 해당 단계에 대한 참석
  if (phase_id) {
    // 단계가 실제로 존재하는지 확인
    const { data: phase, error: phaseError } = await supabase
      .from("schedule_phases")
      .select("*")
      .eq("id", phase_id)
      .eq("schedule_id", schedule_id)
      .single();

    if (phaseError || !phase) {
      throw new Error("Phase not found");
    }
  }

  // 3. 기존 참석 정보 확인
  const { data: existingAttendance } = await supabase
    .from("schedule_attendances")
    .select("*")
    .eq("schedule_id", schedule_id)
    .eq("user_id", user_id)
    .eq("phase_id", phase_id || "")
    .maybeSingle();

  let attendance: ScheduleAttendance;

  if (existingAttendance) {
    // 기존 참석 정보 업데이트
    const { data, error } = await supabase
      .from("schedule_attendances")
      .update({
        status,
        user_note: user_note || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingAttendance.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update attendance: ${error.message}`);
    }

    attendance = data as ScheduleAttendance;
  } else {
    // 새로운 참석 정보 생성
    // attending 상태일 때만 정원 체크
    if (status === "attending") {
      const { data: currentAttendances } = await supabase
        .from("schedule_attendances")
        .select("id")
        .eq("schedule_id", schedule_id)
        .eq("status", "attending")
        .is("phase_id", null); // 전체 일정 참석자만 카운트

      const currentCount = currentAttendances?.length || 0;

      if (
        schedule.total_capacity !== null &&
        currentCount >= schedule.total_capacity &&
        !phase_id
      ) {
        // 전체 일정의 경우에만 정원 체크
        if (schedule.allow_waitlist) {
          // 대기열로 등록
          const { data, error } = await supabase
            .from("schedule_attendances")
            .insert({
              schedule_id,
              user_id,
              phase_id: phase_id || null,
              status: "waitlist",
              user_note: user_note || null,
            })
            .select()
            .single();

          if (error) {
            throw new Error(`Failed to register attendance: ${error.message}`);
          }

          attendance = data as ScheduleAttendance;
        } else {
          throw new Error("Schedule is full and waitlist is not allowed");
        }
      } else {
        // 정원 여유 있음 - 바로 참석 등록
        const { data, error } = await supabase
          .from("schedule_attendances")
          .insert({
            schedule_id,
            user_id,
            phase_id: phase_id || null,
            status,
            user_note: user_note || null,
          })
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to register attendance: ${error.message}`);
        }

        attendance = data as ScheduleAttendance;
      }
    } else {
      // not_attending, maybe 상태는 정원 상관없이 등록
      const { data, error } = await supabase
        .from("schedule_attendances")
        .insert({
          schedule_id,
          user_id,
          phase_id: phase_id || null,
          status,
          user_note: user_note || null,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to register attendance: ${error.message}`);
      }

      attendance = data as ScheduleAttendance;
    }
  }

  return { attendance };
}

/**
 * 단계별 참석 정보 조회
 * @param schedule_id - 일정 ID
 * @param user_id - 사용자 ID
 * @returns 단계별 참석 정보 배열
 */
export async function getPhaseAttendances(
  schedule_id: string,
  user_id: string,
): Promise<{ attendances: ScheduleAttendance[] }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("schedule_attendances")
    .select("*")
    .eq("schedule_id", schedule_id)
    .eq("user_id", user_id);

  if (error) {
    throw new Error(`Failed to fetch phase attendances: ${error.message}`);
  }

  return { attendances: (data as ScheduleAttendance[]) || [] };
}
