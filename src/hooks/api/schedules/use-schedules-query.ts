import { useQuery } from '@tanstack/react-query'
import type { ScheduleListItem } from '@/types/schedule.types'

export const schedulesQueryKey = (limit?: number) => ['schedules', { limit }] as const

export function useSchedulesQuery(limit?: number) {
  return useQuery({
    queryKey: schedulesQueryKey(limit),
    queryFn: async (): Promise<{ schedules: ScheduleListItem[] }> => {
      const url = limit ? `/api/schedules?limit=${limit}` : '/api/schedules'
      const res = await fetch(url)
      if (!res.ok) throw new Error('일정 목록을 불러오는데 실패했습니다')
      return res.json()
    },
    staleTime: 60_000,
    gcTime: 300_000,
  })
}
