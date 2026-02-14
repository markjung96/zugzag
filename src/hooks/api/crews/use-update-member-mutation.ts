import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/utils/get-error-message'
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
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        const err = new Error(
          (errData as { error?: string })?.error || '멤버 역할 변경에 실패했습니다'
        ) as Error & { code?: string }
        err.code = (errData as { code?: string })?.code
        throw err
      }
      return res.json()
    },
    onMutate: async ({ memberId, role }) => {
      await queryClient.cancelQueries({ queryKey: crewMembersQueryKey(crewId) })
      const previousMembers = queryClient.getQueryData(crewMembersQueryKey(crewId))

      queryClient.setQueryData(crewMembersQueryKey(crewId), (old: { members?: { id: string; role: string }[] }) => {
        if (!old) return old
        const updateMember = (members: { id: string; role: string }[]) =>
          members.map((m) => (m.id === memberId ? { ...m, role } : m))
        if (old.members) return { ...old, members: updateMember(old.members) }
        return old
      })

      return { previousMembers }
    },
    onError: (err, variables, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(crewMembersQueryKey(crewId), context.previousMembers)
      }
      toast.error(getErrorMessage(err), { duration: 4000 })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: crewMembersQueryKey(crewId) })
    },
  })
}
