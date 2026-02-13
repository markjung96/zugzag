import { useQuery } from '@tanstack/react-query'
import type { CrewScheduleListItem } from '@/types/schedule.types'

export const crewSchedulesQueryKey = (crewId: string) => ['crew-schedules', crewId] as const

export function useCrewSchedulesQuery(crewId: string) {
  return useQuery({
    queryKey: crewSchedulesQueryKey(crewId),
    queryFn: async (): Promise<{ schedules: CrewScheduleListItem[] }> => {
      const res = await fetch(`/api/crews/${crewId}/schedules`)
      if (!res.ok) throw new Error('크루 일정을 불러오는데 실패했습니다')
      return res.json()
    },
    enabled: !!crewId,
  })
}
