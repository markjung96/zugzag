import { useQuery } from '@tanstack/react-query'
import type { CrewDetail } from '@/types/crew.types'

export const crewQueryKey = (crewId: string) => ['crew', crewId] as const

export function useCrewQuery(crewId: string) {
  return useQuery({
    queryKey: crewQueryKey(crewId),
    queryFn: async (): Promise<CrewDetail> => {
      const res = await fetch(`/api/crews/${crewId}`)
      if (!res.ok) throw new Error('크루 정보를 불러오는데 실패했습니다')
      return res.json()
    },
    enabled: !!crewId,
  })
}
