import { useQuery } from "@tanstack/react-query";

import type { Tables } from "@/lib/supabase/database.types";

/**
 * 체크인 관리용 참석자 타입
 */
export type CheckInAttendance = Pick<
  Tables<"schedule_attendances">,
  | "id"
  | "user_id"
  | "status"
  | "checked_in_at"
  | "checked_out_at"
  | "user_note"
  | "admin_note"
  | "waitlist_position"
  | "created_at"
> & {
  user: Pick<Tables<"profiles">, "id" | "full_name" | "avatar_url" | "nickname" | "climbing_level">;
  phase: Pick<Tables<"schedule_phases">, "id" | "phase_number" | "title"> | null;
};

/**
 * API 응답 타입
 */
export type CheckInAttendancesResponse = {
  attendances: CheckInAttendance[];
};

async function fetchCheckInAttendances(scheduleId: string): Promise<CheckInAttendancesResponse> {
  const response = await fetch(`/api/schedules/${scheduleId}/check-in`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch check-in attendances");
  }

  return response.json();
}

export function useCheckInAttendancesQuery(scheduleId: string) {
  return useQuery<CheckInAttendancesResponse>({
    queryKey: ["schedule-check-in", scheduleId],
    queryFn: () => fetchCheckInAttendances(scheduleId),
  });
}
