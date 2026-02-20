import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/utils/get-error-message'
import { crewQueryKey } from './use-crew-query'

export function useRegenerateInviteCodeMutation(crewId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (): Promise<{ inviteCode: string }> => {
      const res = await fetch(`/api/crews/${crewId}/regenerate-code`, {
        method: 'POST',
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        const err = new Error(
          (errData as { error?: string })?.error ?? '초대 코드 재생성에 실패했습니다'
        ) as Error & { code?: string }
        err.code = (errData as { code?: string })?.code
        throw err
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crewQueryKey(crewId) })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error), { duration: 4000 })
    },
  })
}
