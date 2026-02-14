import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/utils/get-error-message'
import { profileStatsQueryKey } from './use-profile-stats-query'

export interface UpdatedUser {
  id: string
  email: string | null
  name: string
  image: string | null
}

export interface UseUpdateProfileMutationOptions {
  onSuccess?: (data: UpdatedUser) => void
}

export function useUpdateProfileMutation(options?: UseUpdateProfileMutationOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (name: string): Promise<UpdatedUser> => {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string; code?: string }
        const err = new Error(data.error ?? '프로필 수정에 실패했습니다') as Error & { code?: string }
        err.code = data.code
        throw err
      }
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: profileStatsQueryKey })
      toast.success('프로필이 수정되었습니다')
      options?.onSuccess?.(data)
    },
    onError: (error) => {
      toast.error(getErrorMessage(error), { duration: 4000 })
    },
  })
}
