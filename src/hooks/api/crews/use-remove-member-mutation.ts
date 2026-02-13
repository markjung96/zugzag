import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crewQueryKey } from './use-crew-query'
import { crewMembersQueryKey } from './use-crew-members-query'

export function useRemoveMemberMutation(crewId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (memberId: string) => {
      const res = await fetch(`/api/crews/${crewId}/members/${memberId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('멤버 내보내기에 실패했습니다')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crewMembersQueryKey(crewId) })
      queryClient.invalidateQueries({ queryKey: crewQueryKey(crewId) })
    },
  })
}
