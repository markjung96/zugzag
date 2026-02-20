import { useSuspenseQuery } from "@tanstack/react-query";
import { CACHE_TIME } from "@/lib/constants/cache";

export const profileStatsQueryKey = ["profile-stats"] as const;

interface ProfileStats {
  totalCrews: number;
  totalSchedules: number;
  attendanceRate: number;
}

export function useProfileStatsQuery() {
  return useSuspenseQuery({
    queryKey: profileStatsQueryKey,
    queryFn: async (): Promise<ProfileStats> => {
      const res = await fetch("/api/profile/stats");
      if (!res.ok) throw new Error("프로필 통계를 불러오는데 실패했습니다");
      return res.json();
    },
    staleTime: CACHE_TIME.static,
    gcTime: CACHE_TIME.gc,
  });
}
