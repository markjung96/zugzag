"use client"

import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  UserCheck,
  UserX,
  Trash2,
  MoreVertical,
  Dumbbell,
  Utensils,
  PartyPopper,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Pencil,
  Loader2,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/utils/get-error-message"
import { scheduleQueryKey } from "@/hooks/api/schedules/use-schedule-query"
import { schedulesQueryKey } from "@/hooks/api/schedules/use-schedules-query"
import { crewSchedulesQueryKey } from "@/hooks/api/crews/use-crew-schedules-query"

type RoundType = "exercise" | "meal" | "afterparty" | "other"

type Attendee = {
  id: string
  userId: string
  name: string
  image: string | null
}

type Round = {
  id: string
  roundNumber: number
  type: RoundType
  title: string
  startTime: string
  endTime: string
  location: string
  capacity: number
  attendingCount: number
  waitingCount: number
  myStatus: "attending" | "waiting" | null
  attendees: Attendee[]
  waitlist: Attendee[]
}

type ScheduleDetail = {
  id: string
  title: string
  date: string
  description: string | null
  crewId: string
  crewName: string
  canManage: boolean
  rounds: Round[]
}

const ROUND_TYPE_CONFIG: Record<RoundType, { label: string; icon: typeof Dumbbell }> = {
  exercise: { label: "운동", icon: Dumbbell },
  meal: { label: "식사", icon: Utensils },
  afterparty: { label: "뒷풀이", icon: PartyPopper },
  other: { label: "기타", icon: MoreHorizontal },
}

async function fetchSchedule(scheduleId: string): Promise<ScheduleDetail> {
  const res = await fetch(`/api/schedules/${scheduleId}`)
  if (!res.ok) throw new Error("Failed to fetch schedule")
  return res.json()
}

async function createRsvp(roundId: string) {
  const res = await fetch(`/api/rounds/${roundId}/rsvp`, {
    method: "POST",
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error || "Failed to create RSVP")
  }
  return res.json()
}

async function deleteRsvp(roundId: string) {
  const res = await fetch(`/api/rounds/${roundId}/rsvp`, {
    method: "DELETE",
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error || "Failed to delete RSVP")
  }
  return res.json()
}

async function deleteSchedule(scheduleId: string) {
  const res = await fetch(`/api/schedules/${scheduleId}`, {
    method: "DELETE",
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error || "Failed to delete schedule")
  }
  return res.json()
}

export function ScheduleDetailContent() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()

  const crewId = params.id as string
  const scheduleId = params.scheduleId as string

  const [expandedRounds, setExpandedRounds] = useState<Set<string>>(new Set())

  const { data: schedule, isLoading, error } = useQuery({
    queryKey: scheduleQueryKey(scheduleId),
    queryFn: () => fetchSchedule(scheduleId),
  })

  const rsvpMutation = useMutation({
    mutationFn: createRsvp,
    onMutate: async (roundId) => {
      await queryClient.cancelQueries({ queryKey: scheduleQueryKey(scheduleId) })

      const previousData = queryClient.getQueryData<ScheduleDetail>(scheduleQueryKey(scheduleId))

      if (previousData) {
        const targetRound = previousData.rounds.find((r) => r.id === roundId)
        const isUnlimited = targetRound?.capacity === 0
        const isFull = !isUnlimited && targetRound && targetRound.attendingCount >= targetRound.capacity

        queryClient.setQueryData<ScheduleDetail>(scheduleQueryKey(scheduleId), {
          ...previousData,
          rounds: previousData.rounds.map((round) =>
            round.id === roundId
              ? {
                  ...round,
                  myStatus: isFull ? "waiting" : "attending",
                  attendingCount: isFull ? round.attendingCount : round.attendingCount + 1,
                  waitingCount: isFull ? round.waitingCount + 1 : round.waitingCount,
                }
              : round
          ),
        })
      }

      return { previousData }
    },
    onError: (err, _roundId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(scheduleQueryKey(scheduleId), context.previousData)
      }
      toast.error(getErrorMessage(err), { duration: 4000 })
    },
    onSuccess: () => {
      toast.success('참석이 등록되었습니다')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: scheduleQueryKey(scheduleId) })
      queryClient.invalidateQueries({ queryKey: schedulesQueryKey() })
      queryClient.invalidateQueries({ queryKey: crewSchedulesQueryKey(crewId) })
    },
  })

  const cancelMutation = useMutation({
    mutationFn: deleteRsvp,
    onMutate: async (roundId) => {
      await queryClient.cancelQueries({ queryKey: scheduleQueryKey(scheduleId) })

      const previousData = queryClient.getQueryData<ScheduleDetail>(scheduleQueryKey(scheduleId))

      if (previousData) {
        const targetRound = previousData.rounds.find((r) => r.id === roundId)
        const wasWaiting = targetRound?.myStatus === "waiting"

        queryClient.setQueryData<ScheduleDetail>(scheduleQueryKey(scheduleId), {
          ...previousData,
          rounds: previousData.rounds.map((round) =>
            round.id === roundId
              ? {
                  ...round,
                  myStatus: null,
                  attendingCount: wasWaiting ? round.attendingCount : Math.max(0, round.attendingCount - 1),
                  waitingCount: wasWaiting ? Math.max(0, round.waitingCount - 1) : round.waitingCount,
                }
              : round
          ),
        })
      }

      return { previousData }
    },
    onError: (err, _roundId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(scheduleQueryKey(scheduleId), context.previousData)
      }
      toast.error(getErrorMessage(err), { duration: 4000 })
    },
    onSuccess: () => {
      toast.success('참석이 취소되었습니다')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: scheduleQueryKey(scheduleId) })
      queryClient.invalidateQueries({ queryKey: schedulesQueryKey() })
      queryClient.invalidateQueries({ queryKey: crewSchedulesQueryKey(crewId) })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteSchedule(scheduleId),
    onError: (error) => {
      toast.error(getErrorMessage(error), { duration: 4000 })
    },
    onSuccess: () => {
      toast.success('일정이 삭제되었습니다')
      queryClient.invalidateQueries({ queryKey: schedulesQueryKey() })
      queryClient.invalidateQueries({ queryKey: crewSchedulesQueryKey(crewId) })
      router.push(`/crews/${crewId}`)
    },
  })

  const toggleExpand = (roundId: string) => {
    setExpandedRounds((prev) => {
      const next = new Set(prev)
      if (next.has(roundId)) {
        next.delete(roundId)
      } else {
        next.add(roundId)
      }
      return next
    })
  }

  if (isLoading) {
    return <LoadingState crewId={crewId} />
  }

  if (error || !schedule) {
    return <ErrorState crewId={crewId} />
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link
              href={`/crews/${crewId}`}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="뒤로 가기"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-bold">일정 상세</h1>
          </div>
          {schedule.canManage && (
            <AlertDialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/crews/${crewId}/schedules/${scheduleId}/edit`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      일정 수정
                    </Link>
                  </DropdownMenuItem>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      일정 삭제
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>일정을 삭제하시겠습니까?</AlertDialogTitle>
                  <AlertDialogDescription>
                    이 작업은 되돌릴 수 없습니다. 모든 참석 정보도 함께 삭제됩니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteMutation.mutate()}
                    disabled={deleteMutation.isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    삭제
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </header>

      <div className="flex flex-1 flex-col px-4 py-5">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-lg bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
              {formatDate(schedule.date)}
            </span>
            <span className="text-sm text-muted-foreground">{schedule.crewName}</span>
          </div>

          <h2 className="mb-2 text-xl font-bold">{schedule.title}</h2>

          {schedule.description && (
            <p className="text-sm text-muted-foreground">{schedule.description}</p>
          )}

          {schedule.rounds.length > 1 && (
            <div className="mt-3 flex items-center gap-1">
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {schedule.rounds.length}개 일정
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 space-y-4">
          {schedule.rounds.map((round) => (
            <RoundCard
              key={round.id}
              round={round}
              isExpanded={expandedRounds.has(round.id)}
              onToggleExpand={() => toggleExpand(round.id)}
              isLoading={rsvpMutation.isPending || cancelMutation.isPending}
              onRsvp={() => rsvpMutation.mutate(round.id)}
              onCancel={() => cancelMutation.mutate(round.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function RoundCard({
  round,
  isExpanded,
  onToggleExpand,
  isLoading,
  onRsvp,
  onCancel,
}: {
  round: Round
  isExpanded: boolean
  onToggleExpand: () => void
  isLoading: boolean
  onRsvp: () => void
  onCancel: () => void
}) {
  const [isWaitlistDialogOpen, setIsWaitlistDialogOpen] = useState(false)
  const config = ROUND_TYPE_CONFIG[round.type]
  const Icon = config.icon
  const isUnlimited = round.capacity === 0
  const isFull = !isUnlimited && round.attendingCount >= round.capacity
  const progressValue = isUnlimited ? 0 : (round.attendingCount / round.capacity) * 100

  const handleRsvpClick = () => {
    if (isFull && !isUnlimited) {
      setIsWaitlistDialogOpen(true)
    } else {
      onRsvp()
    }
  }

  const handleWaitlistConfirm = () => {
    onRsvp()
    setIsWaitlistDialogOpen(false)
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">
                {round.roundNumber}차 {round.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatTime(round.startTime)} - {formatTime(round.endTime)}
              </p>
            </div>
          </div>
          {round.myStatus === "attending" && (
            <span className="rounded-md bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
              참석
            </span>
          )}
          {round.myStatus === "waiting" && (
            <span className="rounded-md bg-warning/10 px-2 py-0.5 text-xs font-semibold text-warning">
              대기
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{round.location}</span>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-medium">참석 현황</span>
            </div>
            <span className={cn("font-semibold", isFull && "text-destructive")}>
              {isUnlimited
                ? `${round.attendingCount}명`
                : `${round.attendingCount} / ${round.capacity}명`}
            </span>
          </div>
          {!isUnlimited && <Progress value={progressValue} className="h-2" />}
          {!isUnlimited && round.waitingCount > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              대기 {round.waitingCount}명
            </p>
          )}
        </div>

        <div className="mt-4">
          {round.myStatus === null ? (
            <Button
              onClick={handleRsvpClick}
              disabled={isLoading}
              className="h-11 w-full rounded-xl text-sm font-semibold"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserCheck className="mr-2 h-4 w-4" />}
              {isFull && !isUnlimited ? "대기 등록" : "참석하기"}
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="h-11 w-full rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserX className="mr-2 h-4 w-4" />}
              참석 취소
            </Button>
          )}
        </div>
      </div>

      {(round.attendees.length > 0 || round.waitlist.length > 0) && (
        <>
          <button
            type="button"
            onClick={onToggleExpand}
            className="flex w-full items-center justify-center gap-1 border-t border-border bg-muted/30 py-2 text-sm text-muted-foreground hover:bg-muted/50"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                참석자 숨기기
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                참석자 보기 ({round.attendees.length + round.waitlist.length})
              </>
            )}
          </button>

          {isExpanded && (
            <div className="border-t border-border px-4 py-3">
              {round.attendees.length > 0 && (
                <div className="mb-3">
                  <h4 className="mb-2 text-xs font-semibold text-muted-foreground">
                    참석자 ({round.attendees.length})
                  </h4>
                  <div className="space-y-2">
                    {round.attendees.map((attendee) => (
                      <AttendeeItem key={attendee.id} attendee={attendee} />
                    ))}
                  </div>
                </div>
              )}

              {round.waitlist.length > 0 && (
                <div>
                  <h4 className="mb-2 text-xs font-semibold text-muted-foreground">
                    대기자 ({round.waitlist.length})
                  </h4>
                  <div className="space-y-2">
                    {round.waitlist.map((attendee) => (
                      <AttendeeItem key={attendee.id} attendee={attendee} isWaiting />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <AlertDialog open={isWaitlistDialogOpen} onOpenChange={setIsWaitlistDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정원이 마감되었습니다</AlertDialogTitle>
            <AlertDialogDescription>
              대기 등록하시겠습니까? 참석자가 취소하면 자동으로 참석이 확정됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleWaitlistConfirm} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              대기 등록
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function AttendeeItem({
  attendee,
  isWaiting,
}: {
  attendee: Attendee
  isWaiting?: boolean
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary overflow-hidden">
        {attendee.image ? (
          <Image
            src={attendee.image}
            alt={attendee.name}
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          attendee.name.charAt(0)
        )}
      </div>
      <span className="flex-1 text-sm font-medium">{attendee.name}</span>
      {isWaiting && (
        <span className="rounded-md bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
          대기
        </span>
      )}
    </div>
  )
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const isToday = dateStr === today.toISOString().split("T")[0]
  const isTomorrow = dateStr === tomorrow.toISOString().split("T")[0]

  if (isToday) return "오늘"
  if (isTomorrow) return "내일"

  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"]
  const weekday = weekdays[date.getDay()]

  return `${month}/${day} (${weekday})`
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":")
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? "오후" : "오전"
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${ampm} ${displayHour}:${minutes}`
}

function LoadingState({ crewId }: { crewId: string }) {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex h-14 items-center px-4">
          <Link
            href={`/crews/${crewId}`}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Skeleton className="ml-2 h-5 w-20 rounded-lg" />
        </div>
      </header>
      <div className="flex flex-1 flex-col px-4 py-5">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="mt-4 space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-border p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ErrorState({ crewId }: { crewId: string }) {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex h-14 items-center gap-2 px-4">
          <Link
            href={`/crews/${crewId}`}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-bold">오류</h1>
        </div>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
        <div className="rounded-full bg-destructive/10 p-4">
          <Calendar className="h-10 w-10 text-destructive" />
        </div>
        <div className="text-center">
          <p className="mb-1 text-sm font-semibold text-destructive">
            일정을 불러올 수 없습니다
          </p>
          <p className="text-xs text-muted-foreground">
            일정을 찾을 수 없거나 권한이 없습니다
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => window.location.reload()}
          className="rounded-xl"
        >
          다시 시도
        </Button>
      </div>
    </div>
  )
}
