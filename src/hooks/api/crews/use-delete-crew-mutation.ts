import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/utils/get-error-message'
import { crewsQueryKey } from './use-crews-query'

export function useDeleteCrewMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (crewId: string) => {
      const res = await fetch(`/api/crews/${crewId}`, { method: 'DELETE' })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        const err = new Error(
          (errData as { error?: string })?.error || '크루 삭제에 실패했습니다'
        ) as Error & { code?: string }
        err.code = (errData as { code?: string })?.code
        throw err
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crewsQueryKey })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error), { duration: Infinity })
    },
  })
}
