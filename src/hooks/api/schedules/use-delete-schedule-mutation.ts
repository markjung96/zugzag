import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/utils/get-error-message'
import { crewSchedulesQueryKey } from '../crews/use-crew-schedules-query'

export function useDeleteScheduleMutation(crewId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (scheduleId: string) => {
      const res = await fetch(`/api/schedules/${scheduleId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string; code?: string }
        const err = new Error(data.error ?? '일정 삭제에 실패했습니다') as Error & { code?: string }
        err.code = data.code
        throw err
      }
    },
    onMutate: async (scheduleId) => {
      await queryClient.cancelQueries({ queryKey: crewSchedulesQueryKey(crewId) })
      await queryClient.cancelQueries({ queryKey: ['schedules'] })

      const previousCrewSchedules = queryClient.getQueryData(crewSchedulesQueryKey(crewId))
      const previousSchedulesQueries = queryClient.getQueriesData({ queryKey: ['schedules'] })

      queryClient.setQueryData(crewSchedulesQueryKey(crewId), (old: { schedules?: { id: string }[] }) => {
        if (!old) return old
        if (old.schedules) return { ...old, schedules: old.schedules.filter((s) => s.id !== scheduleId) }
        return old
      })

      queryClient.setQueriesData(
        { queryKey: ['schedules'] },
        (old: { schedules?: { id: string }[] }) => {
          if (!old) return old
          if (old.schedules) return { ...old, schedules: old.schedules.filter((s) => s.id !== scheduleId) }
          return old
        }
      )

      return { previousCrewSchedules, previousSchedulesQueries }
    },
    onError: (err, scheduleId, context) => {
      if (context?.previousCrewSchedules) {
        queryClient.setQueryData(crewSchedulesQueryKey(crewId), context.previousCrewSchedules)
      }
      if (context?.previousSchedulesQueries) {
        context.previousSchedulesQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      toast.error(getErrorMessage(err), { duration: 4000 })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: crewSchedulesQueryKey(crewId) })
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
    },
  })
}
