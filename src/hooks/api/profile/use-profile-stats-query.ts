import { useQuery } from '@tanstack/react-query'

export const profileStatsQueryKey = ['profile-stats'] as const

interface ProfileStats {
  totalCrews: number
  totalSchedules: number
  attendanceRate: number
}

export function useProfileStatsQuery() {
  return useQuery({
    queryKey: profileStatsQueryKey,
    queryFn: async (): Promise<ProfileStats> => {
      const res = await fetch('/api/profile/stats')
      if (!res.ok) throw new Error('프로필 통계를 불러오는데 실패했습니다')
      return res.json()
    },
    staleTime: Infinity,
    gcTime: 3_600_000,
  })
}
