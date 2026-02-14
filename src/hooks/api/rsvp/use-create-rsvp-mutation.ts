import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/utils/get-error-message'
import { scheduleQueryKey } from '../schedules/use-schedule-query'
import { crewSchedulesQueryKey } from '../crews/use-crew-schedules-query'
import type { ScheduleDetail } from '@/types/schedule.types'

export function useCreateRsvpMutation(scheduleId: string, crewId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (roundId: string) => {
      const res = await fetch(`/api/rounds/${roundId}/rsvp`, { method: 'POST' })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        const err = new Error(
          (errData as { error?: string })?.error || '참석 신청에 실패했습니다'
        ) as Error & { code?: string }
        err.code = (errData as { code?: string })?.code
        throw err
      }
      return res.json()
    },
    onMutate: async (roundId) => {
      await queryClient.cancelQueries({ queryKey: scheduleQueryKey(scheduleId) })
      const previous = queryClient.getQueryData<ScheduleDetail>(scheduleQueryKey(scheduleId))

      if (previous) {
        queryClient.setQueryData<ScheduleDetail>(scheduleQueryKey(scheduleId), {
          ...previous,
          rounds: previous.rounds.map(round =>
            round.id === roundId
              ? { ...round, userRsvpStatus: 'attending' as const }
              : round
          ),
        })
      }

      return { previous }
    },
    onError: (err, roundId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(scheduleQueryKey(scheduleId), context.previous)
      }
      toast.error(getErrorMessage(err), { duration: Infinity })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: scheduleQueryKey(scheduleId) })
      queryClient.invalidateQueries({ queryKey: crewSchedulesQueryKey(crewId) })
    },
  })
}
