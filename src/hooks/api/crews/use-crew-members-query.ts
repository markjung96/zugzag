import { useQuery } from '@tanstack/react-query'
import type { CrewMember } from '@/types/crew.types'

export const crewMembersQueryKey = (crewId: string) => ['crew-members', crewId] as const

export function useCrewMembersQuery(crewId: string) {
  return useQuery({
    queryKey: crewMembersQueryKey(crewId),
    queryFn: async (): Promise<{ members: CrewMember[] }> => {
      const res = await fetch(`/api/crews/${crewId}/members`)
      if (!res.ok) throw new Error('멤버 목록을 불러오는데 실패했습니다')
      return res.json()
    },
    enabled: !!crewId,
  })
}
