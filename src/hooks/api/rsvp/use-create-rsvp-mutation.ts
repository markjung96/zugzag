import { useMutation, useQueryClient } from '@tanstack/react-query'
import { scheduleQueryKey } from '../schedules/use-schedule-query'
import { crewSchedulesQueryKey } from '../crews/use-crew-schedules-query'
import type { ScheduleDetail } from '@/types/schedule.types'

export function useCreateRsvpMutation(scheduleId: string, crewId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (roundId: string) => {
      const res = await fetch(`/api/rounds/${roundId}/rsvp`, { method: 'POST' })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '참석 신청에 실패했습니다')
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
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: scheduleQueryKey(scheduleId) })
      queryClient.invalidateQueries({ queryKey: crewSchedulesQueryKey(crewId) })
    },
  })
}
