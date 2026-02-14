import { useQuery } from '@tanstack/react-query'

export const attendanceQueryKey = ['user-attendance'] as const

interface AttendanceStats {
  totalSchedules: number
  attendedSchedules: number
  attendanceRate: number
  crewStats: Array<{
    crewId: string
    crewName: string
    attended: number
    total: number
    attendanceRate: number
  }>
}

export function useAttendanceQuery() {
  return useQuery({
    queryKey: attendanceQueryKey,
    queryFn: async (): Promise<AttendanceStats> => {
      const res = await fetch('/api/users/me/attendance')
      if (!res.ok) throw new Error('출석 통계를 불러오는데 실패했습니다')
      return res.json()
    },
    staleTime: 300_000,
    gcTime: 900_000,
  })
}
