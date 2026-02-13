import { useQuery } from '@tanstack/react-query'

interface Place {
  id: string
  name: string
  address: string
  phone?: string
  category?: string
}

export function usePlacesSearchQuery(query: string, category?: string) {
  return useQuery({
    queryKey: ['places-search', query, category],
    queryFn: async (): Promise<{ places: Place[] }> => {
      const params = new URLSearchParams({ query })
      if (category) params.set('priorityCategory', category)
      const res = await fetch(`/api/places/search?${params}`)
      if (!res.ok) throw new Error('장소 검색에 실패했습니다')
      return res.json()
    },
    enabled: query.length > 0,
  })
}
