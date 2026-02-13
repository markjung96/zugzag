import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crewSchedulesQueryKey } from '../crews/use-crew-schedules-query'
import { schedulesQueryKey } from './use-schedules-query'
import type { RoundType } from '@/types/schedule.types'

interface RoundInput {
  type: RoundType
  time: string | null
  capacity: number
  placeName?: string
  placeAddress?: string
}

interface CreateScheduleData {
  title: string
  description?: string
  date: string
  rounds: RoundInput[]
}

export function useCreateScheduleMutation(crewId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateScheduleData) => {
      const res = await fetch(`/api/crews/${crewId}/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('일정 생성에 실패했습니다')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crewSchedulesQueryKey(crewId) })
      queryClient.invalidateQueries({ queryKey: schedulesQueryKey() })
    },
  })
}
