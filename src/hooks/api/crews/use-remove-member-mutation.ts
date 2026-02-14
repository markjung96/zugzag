import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/utils/get-error-message'
import { crewQueryKey } from './use-crew-query'
import { crewMembersQueryKey } from './use-crew-members-query'

export function useRemoveMemberMutation(crewId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (memberId: string) => {
      const res = await fetch(`/api/crews/${crewId}/members/${memberId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        const err = new Error(
          (errData as { error?: string })?.error || '멤버 내보내기에 실패했습니다'
        ) as Error & { code?: string }
        err.code = (errData as { code?: string })?.code
        throw err
      }
    },
    onMutate: async (memberId) => {
      await queryClient.cancelQueries({ queryKey: crewMembersQueryKey(crewId) })
      const previousMembers = queryClient.getQueryData(crewMembersQueryKey(crewId))

      queryClient.setQueryData(crewMembersQueryKey(crewId), (old: { members?: { id: string }[] }) => {
        if (!old) return old
        if (old.members) {
          return { ...old, members: old.members.filter((m) => m.id !== memberId) }
        }
        return old
      })

      return { previousMembers }
    },
    onError: (err, memberId, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(crewMembersQueryKey(crewId), context.previousMembers)
      }
      toast.error(getErrorMessage(err), { duration: 4000 })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: crewMembersQueryKey(crewId) })
      queryClient.invalidateQueries({ queryKey: crewQueryKey(crewId) })
    },
  })
}
