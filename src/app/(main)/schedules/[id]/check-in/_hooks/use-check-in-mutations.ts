import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * 체크인 액션 데이터 타입
 */
export type CheckInActionData =
  | {
      action: "check_in" | "check_out";
      attendance_id: string;
      admin_note?: string;
    }
  | {
      action: "update_status";
      attendance_id: string;
      status:
        | "attending"
        | "not_attending"
        | "maybe"
        | "waitlist"
        | "late"
        | "early_leave"
        | "no_show";
      admin_note?: string;
    }
  | {
      action: "promote";
      attendance_id: string;
    }
  | {
      action: "auto_mark_noshow";
    };

async function performCheckInAction(scheduleId: string, data: CheckInActionData) {
  const response = await fetch(`/api/schedules/${scheduleId}/check-in`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to perform check-in action");
  }

  return response.json();
}

export function useCheckInMutation(scheduleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckInActionData) => performCheckInAction(scheduleId, data),
    onSuccess: () => {
      // 체크인 목록 갱신
      queryClient.invalidateQueries({ queryKey: ["schedule-check-in", scheduleId] });
      // 참석자 목록 갱신
      queryClient.invalidateQueries({ queryKey: ["schedule-attendances", scheduleId] });
      // 일정 상세 갱신
      queryClient.invalidateQueries({ queryKey: ["schedule", scheduleId] });
    },
  });
}
