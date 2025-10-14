import { useQuery } from "@tanstack/react-query";

import type { Tables } from "@/lib/supabase/database.types";

/**
 * 일정 상세 정보 타입 (gym 전체 정보 포함)
 */
export type ScheduleDetail = Pick<
  Tables<"schedules">,
  | "id"
  | "title"
  | "description"
  | "event_date"
  | "is_cancelled"
  | "total_capacity"
  | "tags"
  | "crew_id"
  | "created_at"
  | "created_by"
  | "is_public"
  | "visibility"
  | "allow_waitlist"
  | "rsvp_deadline"
> & {
  crew: Pick<Tables<"crews">, "id" | "name" | "logo_url" | "description"> | null;
  creator: Pick<Tables<"profiles">, "id" | "full_name" | "avatar_url" | "nickname"> | null;
  phases: Array<
    Pick<
      Tables<"schedule_phases">,
      | "id"
      | "phase_number"
      | "title"
      | "start_time"
      | "end_time"
      | "location_text"
      | "capacity"
      | "notes"
      | "gym_id"
    > & {
      gym: Pick<
        Tables<"gyms">,
        | "id"
        | "name"
        | "address"
        | "latitude"
        | "longitude"
        | "phone"
        | "website"
        | "provider"
        | "provider_place_id"
      > | null;
    }
  >;
  attendances?: Array<
    Pick<
      Tables<"schedule_attendances">,
      "id" | "user_id" | "status" | "checked_in_at" | "user_note"
    > & {
      user: Pick<Tables<"profiles">, "id" | "full_name" | "avatar_url" | "nickname">;
    }
  >;
};

/**
 * 일정 상세 응답 타입
 */
export type ScheduleDetailResponse = {
  schedule: ScheduleDetail;
};

/**
 * 참석자 정보 타입
 */
export type AttendanceWithUser = Pick<
  Tables<"schedule_attendances">,
  "id" | "user_id" | "status" | "checked_in_at" | "user_note" | "phase_id"
> & {
  user: Pick<Tables<"profiles">, "id" | "full_name" | "avatar_url" | "nickname" | "climbing_level">;
  phase: Pick<Tables<"schedule_phases">, "id" | "phase_number" | "title"> | null;
};

/**
 * 참석자 목록 응답 타입
 */
export type AttendancesResponse = {
  attendances: AttendanceWithUser[];
};

async function fetchScheduleById(id: string): Promise<ScheduleDetailResponse> {
  const response = await fetch(`/api/schedules/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch schedule");
  }

  return response.json();
}

async function fetchAttendances(scheduleId: string, status?: string): Promise<AttendancesResponse> {
  const searchParams = new URLSearchParams();
  if (status) searchParams.append("status", status);

  const response = await fetch(
    `/api/schedules/${scheduleId}/attendances?${searchParams.toString()}`,
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch attendances");
  }

  return response.json();
}

export function useScheduleDetailQuery(scheduleId: string) {
  return useQuery<ScheduleDetailResponse>({
    queryKey: ["schedule", scheduleId],
    queryFn: () => fetchScheduleById(scheduleId),
    enabled: !!scheduleId,
  });
}

export function useScheduleAttendancesQuery(scheduleId: string, status?: string) {
  return useQuery<AttendancesResponse>({
    queryKey: ["schedule-attendances", scheduleId, status],
    queryFn: () => fetchAttendances(scheduleId, status),
    enabled: !!scheduleId,
  });
}
