import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crewSchedulesQueryKey } from '../crews/use-crew-schedules-query'
import { schedulesQueryKey } from './use-schedules-query'

export function useDeleteScheduleMutation(crewId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (scheduleId: string) => {
      const res = await fetch(`/api/schedules/${scheduleId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('일정 삭제에 실패했습니다')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crewSchedulesQueryKey(crewId) })
      queryClient.invalidateQueries({ queryKey: schedulesQueryKey() })
    },
  })
}
