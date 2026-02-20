import { useSuspenseQuery } from "@tanstack/react-query";
import type { ScheduleDetail } from "@/types/schedule.types";
import { CACHE_TIME } from "@/lib/constants/cache";

export const scheduleQueryKey = (scheduleId: string) => ["schedule", scheduleId] as const;

export function useScheduleQuery(scheduleId: string) {
  return useSuspenseQuery({
    queryKey: scheduleQueryKey(scheduleId),
    queryFn: async (): Promise<ScheduleDetail> => {
      const res = await fetch(`/api/schedules/${scheduleId}`);
      if (!res.ok) throw new Error("일정을 불러오는데 실패했습니다");
      return res.json();
    },
    staleTime: CACHE_TIME.realtime,
    gcTime: CACHE_TIME.gc,
  });
}
