/**
 * 사용자 통계 조회 React Query Hook
 */

import { useQuery } from "@tanstack/react-query";

import type { UserStatsResponse } from "@/lib/api/user-stats-helpers";

/**
 * 현재 사용자 통계 조회
 */
export function useUserStatsQuery() {
  return useQuery<UserStatsResponse>({
    queryKey: ["user", "stats"],
    queryFn: async () => {
      const response = await fetch("/api/users/me/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch user stats");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5분간 fresh
    gcTime: 1000 * 60 * 10, // 10분간 캐시 유지
  });
}
