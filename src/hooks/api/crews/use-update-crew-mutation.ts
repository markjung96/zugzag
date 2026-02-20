import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/utils/get-error-message'
import { crewQueryKey } from './use-crew-query'
import { crewsQueryKey } from './use-crews-query'

interface UpdateCrewData {
  name: string
  description?: string
}

export function useUpdateCrewMutation(crewId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateCrewData) => {
      const res = await fetch(`/api/crews/${crewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        const err = new Error(
          (errData as { error?: string })?.error || '크루 수정에 실패했습니다'
        ) as Error & { code?: string }
        err.code = (errData as { code?: string })?.code
        throw err
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crewQueryKey(crewId) })
      queryClient.invalidateQueries({ queryKey: crewsQueryKey })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error), { duration: 4000 })
    },
  })
}
