import { useSuspenseQuery } from '@tanstack/react-query'
import type { CrewDetail } from '@/types/crew.types'
import { CACHE_TIME } from '@/lib/constants/cache'

export const crewQueryKey = (crewId: string) => ['crew', crewId] as const

export function useCrewQuery(crewId: string) {
  if (!crewId || crewId === 'undefined') {
    throw new Error('crewId is required')
  }

  return useSuspenseQuery({
    queryKey: crewQueryKey(crewId),
    queryFn: async (): Promise<CrewDetail> => {
      const res = await fetch(`/api/crews/${crewId}`)
      if (!res.ok) throw new Error('크루 정보를 불러오는데 실패했습니다')
      return res.json()
    },
    staleTime: CACHE_TIME.standard,
    gcTime: CACHE_TIME.gc,
  })
}
