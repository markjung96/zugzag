import { useSuspenseQuery } from "@tanstack/react-query";
import type { ScheduleListItem } from "@/types/schedule.types";
import { CACHE_TIME } from "@/lib/constants/cache";

export const schedulesQueryKey = (limit?: number) => ["schedules", { limit }] as const;

export function useSchedulesQuery(limit?: number) {
  return useSuspenseQuery({
    queryKey: schedulesQueryKey(limit),
    queryFn: async (): Promise<{ schedules: ScheduleListItem[] }> => {
      const url = limit ? `/api/schedules?limit=${limit}` : "/api/schedules";
      const res = await fetch(url);
      if (!res.ok) throw new Error("일정 목록을 불러오는데 실패했습니다");
      return res.json();
    },
    staleTime: CACHE_TIME.standard,
    gcTime: CACHE_TIME.gc,
  });
}
