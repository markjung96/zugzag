import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crewsQueryKey } from './use-crews-query'

interface CreateCrewData {
  name: string
  description?: string
}

export function useCreateCrewMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateCrewData) => {
      const res = await fetch('/api/crews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('크루 생성에 실패했습니다')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crewsQueryKey })
    },
  })
}
