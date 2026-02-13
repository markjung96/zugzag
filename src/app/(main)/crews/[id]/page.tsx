'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  Settings,
  Users,
  Clock,
  MapPin,
  Plus,
  Calendar,
  ArrowLeft,
  Copy,
  Check,
  Share2,
  BarChart3,
  Dumbbell,
  Utensils,
  PartyPopper,
  MoreHorizontal,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { useCrewQuery } from '@/hooks/api/crews/use-crew-query'
import { useCrewSchedulesQuery } from '@/hooks/api/crews/use-crew-schedules-query'
import { useClipboard } from '@/hooks/common/use-clipboard'
import type { RoundType, CrewScheduleListItem } from '@/types/schedule.types'

const ROUND_TYPE_CONFIG: Record<RoundType, { label: string; icon: typeof Dumbbell }> = {
  exercise: { label: '운동', icon: Dumbbell },
  meal: { label: '식사', icon: Utensils },
  afterparty: { label: '뒷풀이', icon: PartyPopper },
  other: { label: '기타', icon: MoreHorizontal },
}

export default function CrewHomePage() {
  const params = useParams()
  const crewId = params.id as string

  const { data: crew, isLoading: crewLoading } = useCrewQuery(crewId)
  const { data: schedulesData, isLoading: schedulesLoading } = useCrewSchedulesQuery(crewId)

  const { copied, copy } = useClipboard()

  const schedules = schedulesData?.schedules ?? []

  if (crewLoading) {
    return <LoadingState />
  }

  if (!crew) {
    return <ErrorState />
  }

  const isLeader = crew.myRole === 'leader'
  const canManage = crew.canManage

  const handleCopyInviteCode = () => {
    if (crew.inviteCode) {
      copy(crew.inviteCode)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${crew.name} 크루 초대`,
        text: `초대 코드: ${crew.inviteCode}`,
      })
    } else if (crew.inviteCode) {
      copy(crew.inviteCode)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link
              href="/crews"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="뒤로 가기"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <h1 className="text-lg font-bold">{crew.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {canManage && (
              <Link
                href={`/crews/${crewId}/stats`}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="크루 통계"
              >
                <BarChart3 className="h-5 w-5" />
              </Link>
            )}
            {isLeader && (
              <Link
                href={`/crews/${crewId}/settings`}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="크루 설정"
              >
                <Settings className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 px-4 py-5">
        <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card to-card/80">
          {crew.description && (
            <div className="border-b border-border/50 px-5 py-4">
              <p className="text-sm leading-relaxed text-muted-foreground">{crew.description}</p>
            </div>
          )}

          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">크루 멤버</p>
                <p className="text-xl font-bold">{crew.memberCount}명</p>
              </div>
            </div>
            {canManage && (
              <Link
                href={`/crews/${crewId}/members`}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
              >
                관리
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          {canManage && crew.inviteCode && (
            <div className="border-t border-border/50 bg-muted/30 p-5">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">초대 코드</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-mono text-3xl font-bold tracking-[0.3em] text-primary">{crew.inviteCode}</p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCopyInviteCode}
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 rounded-xl border-2 transition-all hover:border-primary hover:bg-primary/5"
                    aria-label="초대 코드 복사"
                  >
                    {copied ? <Check className="h-5 w-5 text-success" /> : <Copy className="h-5 w-5" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 rounded-xl border-2 transition-all hover:border-primary hover:bg-primary/5"
                    aria-label="초대 링크 공유"
                    onClick={handleShare}
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              {copied && <p className="mt-3 text-sm font-medium text-success">클립보드에 복사되었습니다</p>}
            </div>
          )}
        </div>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">다가오는 일정</h2>
            </div>
            {schedules.length > 0 && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-bold text-primary-foreground">
                {schedules.length}
              </span>
            )}
          </div>

          {schedulesLoading ? (
            <div className="flex justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
                <p className="text-sm font-medium text-muted-foreground">일정을 불러오는 중...</p>
              </div>
            </div>
          ) : schedules.length > 0 ? (
            <div className="flex flex-col gap-4">
              {schedules.map((schedule) => (
                <ScheduleCard key={schedule.id} schedule={schedule} crewId={crewId} />
              ))}
            </div>
          ) : (
            <EmptyState canManage={canManage} crewId={crewId} />
          )}
        </section>
      </div>

      {canManage && (
        <Link
          href={`/crews/${crewId}/schedules/new`}
          className="fixed bottom-24 right-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-xl shadow-primary/25 transition-all hover:shadow-2xl hover:shadow-primary/30 active:scale-95"
          aria-label="새 일정 만들기"
        >
          <Plus className="h-7 w-7" />
        </Link>
      )}
    </div>
  )
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? '오후' : '오전'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${ampm} ${displayHour}:${minutes}`
}

function ScheduleCard({ schedule, crewId }: { schedule: CrewScheduleListItem; crewId: string }) {
  const isUnlimited = schedule.capacity === 0
  const progressValue = isUnlimited ? 0 : (schedule.attendingCount / schedule.capacity) * 100
  const isFull = !isUnlimited && schedule.attendingCount >= schedule.capacity

  const firstRound = schedule.rounds?.[0]
  const FirstRoundIcon = firstRound ? ROUND_TYPE_CONFIG[firstRound.type].icon : Dumbbell

  return (
    <Link href={`/crews/${crewId}/schedules/${schedule.id}`}>
      <div className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98]">
        <div className="flex items-stretch">
          <div className="flex w-20 shrink-0 flex-col items-center justify-center bg-primary/10 py-4">
            <span className="text-2xl font-bold text-primary">{new Date(schedule.date).getDate()}</span>
            <span className="text-xs font-medium text-primary/80">
              {['일', '월', '화', '수', '목', '금', '토'][new Date(schedule.date).getDay()]}요일
            </span>
          </div>

          <div className="flex flex-1 flex-col p-4">
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
              {schedule.roundCount > 1 && (
                <div className="flex items-center gap-1.5">
                  <FirstRoundIcon className="h-3.5 w-3.5" />
                  <span>{schedule.roundCount}개 일정</span>
                </div>
              )}
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

function EmptyState({ canManage, crewId }: { canManage: boolean; crewId: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20 py-16">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
        <Calendar className="h-10 w-10 text-primary" />
      </div>
      <h3 className="mb-2 text-xl font-bold">아직 일정이 없어요</h3>
      <p className="mb-6 text-center text-sm leading-relaxed text-muted-foreground">
        {canManage ? '첫 번째 일정을 만들어\n크루원들과 공유해보세요' : '크루장이 일정을 만들면\n여기에 표시됩니다'}
      </p>
      {canManage && (
        <Link
          href={`/crews/${crewId}/schedules/new`}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          일정 만들기
        </Link>
      )}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex h-14 items-center gap-3 px-4">
          <div className="h-10 w-10 animate-pulse rounded-xl bg-muted" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
            <div className="h-5 w-28 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-6 px-4 py-5">
        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
        <div className="space-y-4">
          <div className="h-6 w-32 animate-pulse rounded-lg bg-muted" />
          <div className="h-32 animate-pulse rounded-2xl bg-muted" />
          <div className="h-32 animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    </div>
  )
}

function ErrorState() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex h-14 items-center gap-3 px-4">
          <Link
            href="/crews"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="뒤로 가기"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-bold">오류</h1>
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
          <h3 className="mb-2 text-lg font-bold text-destructive">크루를 불러올 수 없습니다</h3>
          <p className="text-sm text-muted-foreground">
            크루 정보를 찾을 수 없거나
            <br />
            접근 권한이 없습니다
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/crews"
            className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-accent"
          >
            크루 목록
          </Link>
          <Button onClick={() => window.location.reload()} className="rounded-xl px-5">
            다시 시도
          </Button>
        </div>
      </div>
    </div>
  )
}
