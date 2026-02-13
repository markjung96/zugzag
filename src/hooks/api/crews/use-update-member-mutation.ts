import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crewMembersQueryKey } from './use-crew-members-query'

interface UpdateMemberData {
  memberId: string
  role: 'admin' | 'member'
}

export function useUpdateMemberMutation(crewId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ memberId, role }: UpdateMemberData) => {
      const res = await fetch(`/api/crews/${crewId}/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      if (!res.ok) throw new Error('멤버 역할 변경에 실패했습니다')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crewMembersQueryKey(crewId) })
    },
  })
}
