'use client'

import Link from 'next/link'
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Check,
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { useSchedulesQuery } from '@/hooks/api/schedules/use-schedules-query'

type Schedule = {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
  location: string
  capacity: number
  description: string | null
  crewId: string
  crewName: string
  attendingCount: number
  myStatus: 'attending' | 'waiting' | 'cancelled' | null
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? '오후' : '오전'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${ampm} ${displayHour}:${minutes}`
}

export default function SchedulesPage() {
  const { data, isLoading, error } = useSchedulesQuery()

  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState error={error as Error} />
  }

  const schedules = (data?.schedules ?? []) as Schedule[]
  const hasSchedules = schedules.length > 0

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex h-14 items-center px-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold">내 일정</h1>
          </div>
          {hasSchedules && (
            <span className="ml-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-bold text-primary-foreground">
              {schedules.length}
            </span>
          )}
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 px-4 py-5">
        {hasSchedules ? (
          <div className="flex flex-col gap-4">
            {schedules.map((schedule) => (
              <ScheduleCard key={schedule.id} schedule={schedule} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  )
}

function ScheduleCard({ schedule }: { schedule: Schedule }) {
  const isUnlimited = schedule.capacity === 0
  const progressValue = isUnlimited ? 0 : (schedule.attendingCount / schedule.capacity) * 100
  const isFull = !isUnlimited && schedule.attendingCount >= schedule.capacity
  const scheduleDate = new Date(schedule.date)

  return (
    <Link href={`/crews/${schedule.crewId}/schedules/${schedule.id}`}>
      <div className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98]">
        <div className="flex items-stretch">
          <div className="flex w-20 shrink-0 flex-col items-center justify-center bg-primary/10 py-4">
            <span className="text-2xl font-bold text-primary">{scheduleDate.getDate()}</span>
            <span className="text-xs font-medium text-primary/80">
              {['일', '월', '화', '수', '목', '금', '토'][scheduleDate.getDay()]}요일
            </span>
          </div>

          <div className="flex flex-1 flex-col p-4">
            <div className="mb-1">
              <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                {schedule.crewName}
              </span>
            </div>

            <div className="mb-2 flex items-start justify-between gap-2">
              <h3 className="font-bold leading-tight">{schedule.title}</h3>
              <div className="flex shrink-0 items-center gap-1.5">
                {schedule.myStatus === 'attending' && (
                  <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-xs font-semibold text-success">
                    <Check className="h-3 w-3" />
                    참석
                  </span>
                )}
                {schedule.myStatus === 'waiting' && (
                  <span className="rounded-full bg-warning/10 px-2 py-1 text-xs font-semibold text-warning">
                    대기 중
                  </span>
                )}
              </div>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatTime(schedule.startTime)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate">{schedule.location}</span>
              </div>
            </div>

            <div className="mt-auto">
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">참석</span>
                </div>
                <span className={isFull ? 'font-bold text-destructive' : 'font-semibold'}>
                  {isUnlimited ? `${schedule.attendingCount}명` : `${schedule.attendingCount}/${schedule.capacity}명`}
                  {isFull && ' 마감'}
                </span>
              </div>
              {!isUnlimited && <Progress value={progressValue} className="h-1.5" />}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20 py-16">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
        <Calendar className="h-10 w-10 text-primary" />
      </div>
      <h3 className="mb-2 text-xl font-bold">예정된 일정이 없어요</h3>
      <p className="text-center text-sm leading-relaxed text-muted-foreground">
        가입한 크루의 일정이
        <br />
        여기에 표시됩니다
      </p>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex h-14 items-center gap-2 px-4">
          <div className="h-5 w-5 animate-pulse rounded bg-muted" />
          <div className="h-5 w-16 animate-pulse rounded-lg bg-muted" />
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-6 px-4 py-5">
        <div className="flex justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
            <p className="text-sm font-medium text-muted-foreground">일정을 불러오는 중...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ErrorState({ error }: { error: Error }) {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex h-14 items-center gap-2 px-4">
          <Calendar className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold">내 일정</h1>
        </div>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-destructive/10">
          <svg className="h-12 w-12 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="mb-2 text-lg font-bold text-destructive">일정을 불러올 수 없습니다</h3>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    </div>
  )
}
