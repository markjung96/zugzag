'use client'

import { useState } from 'react'
import {
  MapPin,
  Users,
  UserCheck,
  UserX,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ROUND_TYPE_CONFIG } from '@/lib/constants/round'
import { cn } from '@/lib/utils'
import { formatTime } from '@/lib/utils/format-time'
import type { RoundType } from '@/types/schedule.types'

export interface Attendee {
  id: string
  userId: string
  name: string
  image: string | null
}

export interface Round {
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
  myStatus: 'attending' | 'waiting' | null
  attendees: Attendee[]
  waitlist: Attendee[]
}

interface RoundCardProps {
  round: Round
  isExpanded: boolean
  onToggleExpand: () => void
  isLoading: boolean
  onRsvp: () => void
  onCancel: () => void
}

export function RoundCard({
  round,
  isExpanded,
  onToggleExpand,
  isLoading,
  onRsvp,
  onCancel,
}: RoundCardProps) {
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
          {round.myStatus === 'attending' && (
            <span className="rounded-md bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
              참석
            </span>
          )}
          {round.myStatus === 'waiting' && (
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
            <span className={cn('font-semibold', isFull && 'text-destructive')}>
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
              {isFull && !isUnlimited ? '대기 등록' : '참석하기'}
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
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
        {attendee.image ? (
          <img
            src={attendee.image}
            alt={attendee.name}
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
