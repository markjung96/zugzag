import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { TablesInsert, TablesUpdate } from "@/lib/supabase/database.types";

type ScheduleInsert = TablesInsert<"schedules">;
type SchedulePhaseInsert = TablesInsert<"schedule_phases">;
type ScheduleUpdate = TablesUpdate<"schedules">;

/**
 * 일정 생성 데이터 타입
 */
export type CreateScheduleData = Pick<
  ScheduleInsert,
  | "crew_id"
  | "title"
  | "description"
  | "event_date"
  | "total_capacity"
  | "is_public"
  | "visibility"
  | "rsvp_deadline"
  | "allow_waitlist"
  | "reminder_hours"
  | "tags"
  | "notes"
> & {
  phases: Array<
    Pick<
      SchedulePhaseInsert,
      | "phase_number"
      | "title"
      | "start_time"
      | "end_time"
      | "gym_id"
      | "location_text"
      | "capacity"
      | "notes"
    >
  >;
};

/**
 * 일정 수정 데이터 타입
 */
export type UpdateScheduleData = Omit<
  ScheduleUpdate,
  "id" | "created_at" | "updated_at" | "created_by" | "crew_id"
>;

/**
 * 참석 상태 업데이트 데이터 타입
 */
export type UpdateRSVPData = {
  status: "attending" | "not_attending" | "maybe";
  phase_id?: string;
  user_note?: string;
};

async function createSchedule(data: CreateScheduleData) {
  const response = await fetch("/api/schedules", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create schedule");
  }

  return response.json();
}

async function updateSchedule(id: string, data: UpdateScheduleData) {
  const response = await fetch(`/api/schedules/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update schedule");
  }

  return response.json();
}

async function cancelSchedule(id: string, reason?: string) {
  const response = await fetch(`/api/schedules/${id}/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to cancel schedule");
  }

  return response.json();
}

async function updateRSVP(scheduleId: string, data: UpdateRSVPData) {
  const response = await fetch(`/api/schedules/${scheduleId}/rsvp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update RSVP");
  }

  return response.json();
}

export function useCreateScheduleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateScheduleData) => createSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });
}

export function useUpdateScheduleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateScheduleData }) =>
      updateSchedule(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["schedule", id] });
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });
}

export function useCancelScheduleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => cancelSchedule(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["schedule", id] });
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });
}

export function useUpdateRSVPMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scheduleId, data }: { scheduleId: string; data: UpdateRSVPData }) =>
      updateRSVP(scheduleId, data),
    onSuccess: (_, { scheduleId }) => {
      queryClient.invalidateQueries({ queryKey: ["schedule", scheduleId] });
      queryClient.invalidateQueries({ queryKey: ["schedule-attendances", scheduleId] });
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });
}
