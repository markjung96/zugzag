import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/utils/get-error-message'
import { attendanceQueryKey } from '../users/use-attendance-query'
import { profileStatsQueryKey } from '../profile/use-profile-stats-query'
import { crewsQueryKey } from './use-crews-query'
import { crewQueryKey } from './use-crew-query'
import { crewMembersQueryKey } from './use-crew-members-query'

export function useLeaveCrewMutation(crewId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/crews/${crewId}/leave`, {
        method: 'POST',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string; code?: string }
        const err = new Error(data.error ?? '크루 탈퇴에 실패했습니다') as Error & { code?: string }
        err.code = data.code
        throw err
      }
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: crewsQueryKey })
      const previousCrews = queryClient.getQueryData(crewsQueryKey)

      queryClient.setQueryData(crewsQueryKey, (old: { crews?: { id: string }[] }) => {
        if (!old) return old
        if (old.crews) return { ...old, crews: old.crews.filter((c) => c.id !== crewId) }
        return old
      })

      return { previousCrews }
    },
    onError: (err, variables, context) => {
      if (context?.previousCrews) {
        queryClient.setQueryData(crewsQueryKey, context.previousCrews)
      }
      toast.error(getErrorMessage(err), { duration: 4000 })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: crewsQueryKey })
      queryClient.invalidateQueries({ queryKey: crewQueryKey(crewId) })
      queryClient.invalidateQueries({ queryKey: crewMembersQueryKey(crewId) })
      queryClient.invalidateQueries({ queryKey: attendanceQueryKey })
      queryClient.invalidateQueries({ queryKey: profileStatsQueryKey })
    },
  })
}
