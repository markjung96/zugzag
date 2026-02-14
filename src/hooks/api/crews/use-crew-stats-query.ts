import { useQuery } from '@tanstack/react-query'

export const crewStatsQueryKey = (crewId: string, days: number) => ['crew-stats', crewId, days] as const

export function useCrewStatsQuery(crewId: string, days: number = 30) {
  return useQuery({
    queryKey: crewStatsQueryKey(crewId, days),
    queryFn: async () => {
      const res = await fetch(`/api/crews/${crewId}/stats?days=${days}`)
      if (!res.ok) throw new Error('통계를 불러오는데 실패했습니다')
      return res.json()
    },
    enabled: !!crewId,
    staleTime: 300_000,
    gcTime: 900_000,
  })
}
