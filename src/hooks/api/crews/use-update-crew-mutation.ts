import { useMutation, useQueryClient } from '@tanstack/react-query'
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
      if (!res.ok) throw new Error('크루 수정에 실패했습니다')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crewQueryKey(crewId) })
      queryClient.invalidateQueries({ queryKey: crewsQueryKey })
    },
  })
}
