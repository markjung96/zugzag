import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/utils/get-error-message'
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
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string; code?: string }
        const err = new Error(data.error ?? '일정 생성에 실패했습니다') as Error & { code?: string }
        err.code = data.code
        throw err
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crewSchedulesQueryKey(crewId) })
      queryClient.invalidateQueries({ queryKey: schedulesQueryKey() })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error), { duration: 4000 })
    },
  })
}
