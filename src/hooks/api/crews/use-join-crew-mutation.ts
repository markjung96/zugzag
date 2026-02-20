import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/utils/get-error-message'
import { crewsQueryKey } from './use-crews-query'

export function useJoinCrewMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (inviteCode: string) => {
      const res = await fetch('/api/crews/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        const err = new Error(
          (errData as { error?: string })?.error || '크루 가입에 실패했습니다'
        ) as Error & { code?: string }
        err.code = (errData as { code?: string })?.code
        throw err
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crewsQueryKey })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error), { duration: 4000 })
    },
  })
}
