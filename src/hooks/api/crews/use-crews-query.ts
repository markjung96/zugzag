import { useSuspenseQuery } from "@tanstack/react-query";
import type { Crew } from "@/types/crew.types";
import { CACHE_TIME } from "@/lib/constants/cache";

export const crewsQueryKey = ["crews"] as const;

export function useCrewsQuery() {
  return useSuspenseQuery({
    queryKey: crewsQueryKey,
    queryFn: async (): Promise<{ crews: Crew[] }> => {
      const res = await fetch("/api/crews");
      if (!res.ok) throw new Error("크루 목록을 불러오는데 실패했습니다");
      return res.json();
    },
    staleTime: CACHE_TIME.standard,
    gcTime: CACHE_TIME.gc,
  });
}
