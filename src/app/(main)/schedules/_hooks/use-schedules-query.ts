import { useQuery } from "@tanstack/react-query";

import type { Tables } from "@/lib/supabase/database.types";

/**
 * 일정 조회 파라미터
 */
export type UseSchedulesQueryParams = {
  crew_id?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
  status?: "upcoming" | "past" | "all";
  limit?: number;
  offset?: number;
};

/**
 * API에서 반환하는 일정 데이터 타입
 */
export type ScheduleWithRelations = Pick<
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
> & {
  crew: Pick<Tables<"crews">, "id" | "name" | "logo_url"> | null;
  creator: Pick<Tables<"profiles">, "id" | "full_name" | "avatar_url"> | null;
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
    > & {
      gym: Pick<Tables<"gyms">, "id" | "name" | "address"> | null;
    }
  >;
};

/**
 * API 응답 타입
 */
export type SchedulesResponse = {
  schedules: ScheduleWithRelations[];
  total: number;
  limit: number;
  offset: number;
};

async function fetchSchedules(params: UseSchedulesQueryParams = {}): Promise<SchedulesResponse> {
  const searchParams = new URLSearchParams();

  if (params.crew_id) searchParams.append("crew_id", params.crew_id);
  if (params.user_id) searchParams.append("user_id", params.user_id);
  if (params.start_date) searchParams.append("start_date", params.start_date);
  if (params.end_date) searchParams.append("end_date", params.end_date);
  if (params.status) searchParams.append("status", params.status);
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.offset) searchParams.append("offset", params.offset.toString());

  const response = await fetch(`/api/schedules?${searchParams.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch schedules");
  }

  return response.json();
}

export function useSchedulesQuery(params: UseSchedulesQueryParams = {}) {
  return useQuery<SchedulesResponse>({
    queryKey: ["schedules", params],
    queryFn: () => fetchSchedules(params),
  });
}
