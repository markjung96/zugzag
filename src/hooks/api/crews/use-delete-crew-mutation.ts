import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crewsQueryKey } from './use-crews-query'

export function useDeleteCrewMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (crewId: string) => {
      const res = await fetch(`/api/crews/${crewId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('크루 삭제에 실패했습니다')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crewsQueryKey })
    },
  })
}
