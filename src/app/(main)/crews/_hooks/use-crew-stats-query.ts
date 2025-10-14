import { useQuery } from "@tanstack/react-query";

import type { CrewAllStatsResponse } from "@/lib/api/crew-stats-helpers";

/**
 * 크루 통계 조회
 */
async function fetchCrewStats(crewId: string): Promise<{ stats: CrewAllStatsResponse }> {
  const response = await fetch(`/api/crews/${crewId}/stats`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch crew stats");
  }

  return response.json();
}

export function useCrewStatsQuery(crewId: string | null) {
  return useQuery<{ stats: CrewAllStatsResponse }, Error>({
    queryKey: ["crew-stats", crewId],
    queryFn: () => fetchCrewStats(crewId!),
    enabled: !!crewId,
    staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
  });
}
