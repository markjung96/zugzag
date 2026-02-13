import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crewQueryKey } from './use-crew-query'

export function useRegenerateInviteCodeMutation(crewId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (): Promise<{ inviteCode: string }> => {
      const res = await fetch(`/api/crews/${crewId}/regenerate-code`, {
        method: 'POST',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? '초대 코드 재생성에 실패했습니다')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crewQueryKey(crewId) })
    },
  })
}
