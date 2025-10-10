/**
 * 일정 관리 API Helper 함수
 * 서버 컴포넌트 및 API 라우트에서 사용
 */

import { createClient } from "@/lib/supabase/server";

/**
 * 일정 생성
 */
export async function createEvent(data: {
  crew_id: string;
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
  phases: Array<{
    phase_number: number;
    title: string;
    start_time: string;
    end_time?: string;
    gym_id?: string;
    location_text?: string;
    capacity?: number;
    notes?: string;
  }>;
}) {
  const supabase = await createClient();

  // 1. 이벤트 생성
  const { data: event, error: eventError } = await supabase
    .from("events")
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

  if (eventError) {
    throw new Error(`Failed to create event: ${eventError.message}`);
  }

  // 2. 단계(phases) 생성
  if (data.phases && data.phases.length > 0) {
    const phasesData = data.phases.map((phase) => ({
      event_id: event.id,
      phase_number: phase.phase_number,
      title: phase.title,
      start_time: phase.start_time,
      end_time: phase.end_time,
      gym_id: phase.gym_id,
      location_text: phase.location_text,
      capacity: phase.capacity,
      notes: phase.notes,
    }));

    const { error: phasesError } = await supabase.from("event_phases").insert(phasesData);

    if (phasesError) {
      // 이벤트 롤백 (수동)
      await supabase.from("events").delete().eq("id", event.id);
      throw new Error(`Failed to create event phases: ${phasesError.message}`);
    }
  }

  return { event };
}

/**
 * 일정 목록 조회
 */
export async function getEvents(params: {
  crew_id?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
  status?: "upcoming" | "past" | "all";
  limit?: number;
  offset?: number;
}) {
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
    .from("events")
    .select(
      `
      *,
      crew:crews(id, name, logo_url),
      creator:profiles!events_created_by_fkey(id, full_name, avatar_url),
      phases:event_phases(
        id, phase_number, title, start_time, end_time,
        gym:gyms(id, name, address),
        location_text, capacity, notes
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

  const { data: events, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch events: ${error.message}`);
  }

  // 총 개수 조회
  let countQuery = supabase
    .from("events")
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

  return { events, total: count || 0 };
}

/**
 * 일정 상세 조회
 */
export async function getEventById(id: string) {
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("events")
    .select(
      `
      *,
      crew:crews(id, name, logo_url, description),
      creator:profiles!events_created_by_fkey(id, full_name, avatar_url, nickname),
      phases:event_phases(
        id, phase_number, title, start_time, end_time,
        gym:gyms(id, name, address, phone, website, latitude, longitude),
        location_text, capacity, notes
      ),
      attendances:event_attendances(
        id, user_id, status, checked_in_at, user_note,
        user:profiles(id, full_name, avatar_url, nickname)
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch event: ${error.message}`);
  }

  return { event };
}

/**
 * 일정 수정
 */
export async function updateEvent(
  id: string,
  updates: {
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
  },
) {
  const supabase = await createClient();

  // eslint-disable-next-line
  const { data: event, error } = await (supabase as any)
    .from("events")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update event: ${error.message}`);
  }

  return { event };
}

/**
 * 일정 취소
 */
export async function cancelEvent(id: string, reason?: string, cancelled_by?: string) {
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("events")
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
    throw new Error(`Failed to cancel event: ${error.message}`);
  }

  return { event };
}

/**
 * 일정 삭제
 */
export async function deleteEvent(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete event: ${error.message}`);
  }

  return { success: true };
}

/**
 * 참석 등록
 */
export async function registerAttendance(data: {
  event_id: string;
  user_id: string;
  phase_id?: string;
  user_note?: string;
}) {
  const supabase = await createClient();

  const { data: result, error } = await supabase.rpc("register_event_attendance", {
    p_event_id: data.event_id,
    p_user_id: data.user_id,
    p_phase_id: data.phase_id || undefined,
    p_user_note: data.user_note || undefined,
  });

  if (error) {
    throw new Error(`Failed to register attendance: ${error.message}`);
  }

  return result;
}

/**
 * 참석 상태 변경
 */
export async function updateAttendanceStatus(
  attendance_id: string,
  status: "attending" | "not_attending" | "maybe" | "waitlist" | "late" | "early_leave" | "no_show",
  user_note?: string,
) {
  const supabase = await createClient();

  const { data: attendance, error } = await supabase
    .from("event_attendances")
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
export async function checkInAttendance(attendance_id: string) {
  const supabase = await createClient();

  const { data: attendance, error } = await supabase
    .from("event_attendances")
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
export async function checkOutAttendance(attendance_id: string) {
  const supabase = await createClient();

  const { data: attendance, error } = await supabase
    .from("event_attendances")
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
export async function getEventAttendances(event_id: string, status?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("event_attendances")
    .select(
      `
      *,
      user:profiles(id, full_name, avatar_url, nickname, climbing_level),
      phase:event_phases(id, phase_number, title)
    `,
    )
    .eq("event_id", event_id)
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
export async function promoteFromWaitlist(event_id: string) {
  const supabase = await createClient();

  const { error } = await supabase.rpc("promote_from_waitlist", {
    p_event_id: event_id,
  });

  if (error) {
    throw new Error(`Failed to promote from waitlist: ${error.message}`);
  }

  return { success: true };
}

/**
 * 일정 통계 조회
 */
export async function getEventStats(event_id: string) {
  const supabase = await createClient();

  const { data: stats, error } = await supabase
    .from("event_stats")
    .select("*")
    .eq("event_id", event_id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch event stats: ${error.message}`);
  }

  return { stats };
}
