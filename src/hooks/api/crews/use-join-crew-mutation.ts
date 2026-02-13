import { useMutation, useQueryClient } from '@tanstack/react-query'
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
        const error = await res.json()
        throw new Error(error.error || '크루 가입에 실패했습니다')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crewsQueryKey })
    },
  })
}
