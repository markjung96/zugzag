"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useMemo, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeft,
  Clock,
  MapPin,
  Users,
  AlignLeft,
  Plus,
  Trash2,
  Dumbbell,
  Utensils,
  PartyPopper,
  MoreHorizontal,
  AlertCircle,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { ko } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LocationSearch, type Place } from "@/components/location-search"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/utils/get-error-message"

type RoundType = "exercise" | "meal" | "afterparty" | "other"

type PlaceInfo = {
  id: string
  name: string
  address: string
  category?: string
  phone?: string
  x: string
  y: string
  url?: string
}

type RoundInput = {
  roundNumber: number
  type: RoundType
  title: string
  startTime: string
  endTime: string
  location: string
  placeInfo?: PlaceInfo
  capacity: number
  isUnlimited: boolean
}

type UpdateScheduleInput = {
  title: string
  date: string
  description?: string
  rounds: {
    roundNumber: number
    type: RoundType
    title: string
    startTime: string
    endTime: string
    location: string
    placeInfo?: PlaceInfo
    capacity: number
  }[]
}

type ScheduleDetail = {
  id: string
  title: string
  date: string
  description: string | null
  crewId: string
  crewName: string
  canManage: boolean
  rounds: {
    id: string
    roundNumber: number
    type: RoundType
    title: string
    startTime: string
    endTime: string
    location: string
    capacity: number
  }[]
}

async function fetchSchedule(scheduleId: string): Promise<ScheduleDetail> {
  const res = await fetch(`/api/schedules/${scheduleId}`)
  if (!res.ok) throw new Error("Failed to fetch schedule")
  return res.json()
}

async function updateSchedule(scheduleId: string, data: UpdateScheduleInput) {
  const res = await fetch(`/api/schedules/${scheduleId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string; code?: string }
    const err = new Error(data.error ?? "일정 수정에 실패했습니다") as Error & { code?: string }
    err.code = data.code
    throw err
  }

  return res.json()
}

const HOUR_OPTIONS = Array.from({ length: 22 }, (_, i) => i + 6) // 6 ~ 27 (다음날 3시까지)
const MINUTE_OPTIONS = Array.from({ length: 12 }, (_, i) => i * 5)

function parseTime(time: string): { hour: number; minute: number } {
  const [h, m] = time.split(":").map(Number)
  return { hour: h, minute: m }
}

function formatTimeStr(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
}

const ROUND_TYPE_CONFIG: Record<RoundType, { label: string; icon: typeof Dumbbell; defaultTitle: string }> = {
  exercise: { label: "운동", icon: Dumbbell, defaultTitle: "운동" },
  meal: { label: "식사", icon: Utensils, defaultTitle: "식사" },
  afterparty: { label: "뒷풀이", icon: PartyPopper, defaultTitle: "뒷풀이" },
  other: { label: "기타", icon: MoreHorizontal, defaultTitle: "" },
}

function formatTimeDisplay(time: string): string {
  const [hours, minutes] = time.split(":")
  const hour = parseInt(hours, 10)
  if (hour >= 24) {
    const nextDayHour = hour - 24
    const ampm = nextDayHour >= 12 ? "오후" : "오전"
    const displayHour = nextDayHour > 12 ? nextDayHour - 12 : nextDayHour === 0 ? 12 : nextDayHour
    return `다음날 ${ampm} ${displayHour}:${minutes}`
  }
  const ampm = hour >= 12 ? "오후" : "오전"
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${ampm} ${displayHour}:${minutes}`
}

export function EditScheduleContent() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()

  const crewId = params.id as string
  const scheduleId = params.scheduleId as string

  const [isInitialized, setIsInitialized] = useState(false)
  const [title, setTitle] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [description, setDescription] = useState("")
  const [rounds, setRounds] = useState<RoundInput[]>([])
  const [editingRound, setEditingRound] = useState<number | null>(null)
  const [isNewRound, setIsNewRound] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [startHourOpen, setStartHourOpen] = useState(false)
  const [startMinuteOpen, setStartMinuteOpen] = useState(false)
  const [endHourOpen, setEndHourOpen] = useState(false)
  const [endMinuteOpen, setEndMinuteOpen] = useState(false)
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const { data: schedule, isLoading, error, refetch } = useQuery({
    queryKey: ["schedule", scheduleId],
    queryFn: () => fetchSchedule(scheduleId),
  })

  useEffect(() => {
    if (schedule && !isInitialized) {
      setTitle(schedule.title)
      setDate(parseISO(schedule.date))
      setDescription(schedule.description || "")
      setRounds(
        schedule.rounds.map((r) => ({
          roundNumber: r.roundNumber,
          type: r.type,
          title: r.title,
          startTime: r.startTime,
          endTime: r.endTime,
          location: r.location,
          capacity: r.capacity,
          isUnlimited: r.capacity === 0,
        }))
      )
      setIsInitialized(true)
    }
  }, [schedule, isInitialized])

  const mutation = useMutation({
    mutationFn: (data: UpdateScheduleInput) => updateSchedule(scheduleId, data),
    onError: (error) => {
      toast.error(getErrorMessage(error), { duration: 4000 })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule", scheduleId] })
      queryClient.invalidateQueries({ queryKey: ["schedules"] })
      queryClient.invalidateQueries({ queryKey: ["crew-schedules", crewId] })
      router.push(`/crews/${crewId}/schedules/${scheduleId}`)
    },
  })

  const validation = useMemo(() => {
    const errors: string[] = []

    if (!title.trim()) {
      errors.push("일정 제목을 입력해주세요")
    }

    const emptyLocationRounds = rounds
      .filter((r) => !r.location.trim())
      .map((r) => r.roundNumber)
    if (emptyLocationRounds.length > 0) {
      errors.push(`${emptyLocationRounds.join(", ")}차 일정의 장소를 입력해주세요`)
    }

    const invalidCapacityRounds = rounds
      .filter((r) => !r.isUnlimited && r.capacity <= 0)
      .map((r) => r.roundNumber)
    if (invalidCapacityRounds.length > 0) {
      errors.push(`${invalidCapacityRounds.join(", ")}차 일정의 정원을 확인해주세요`)
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }, [title, rounds])

  const handleSaveClick = () => {
    setHasAttemptedSubmit(true)
    if (!validation.isValid) return
    setShowConfirmDialog(true)
  }

  const handleConfirmSubmit = () => {
    setShowConfirmDialog(false)
    mutation.mutate({
      title: title.trim(),
      date: format(date, "yyyy-MM-dd"),
      description: description.trim() || undefined,
      rounds: rounds.map((r) => ({
        roundNumber: r.roundNumber,
        type: r.type,
        title: r.title.trim() || ROUND_TYPE_CONFIG[r.type].defaultTitle,
        startTime: r.startTime,
        endTime: r.endTime,
        location: r.location.trim(),
        placeInfo: r.placeInfo,
        capacity: r.isUnlimited ? 0 : r.capacity,
      })),
    })
  }

  const addRound = () => {
    if (rounds.length >= 5) return
    const lastRound = rounds[rounds.length - 1]
    const newStartTime = lastRound?.endTime || "19:00"
    const { hour, minute } = parseTime(newStartTime)
    const newEndHour = Math.min(hour + 2, 27)
    const newEndTime = formatTimeStr(newEndHour, minute)

    const newRound: RoundInput = {
      roundNumber: rounds.length + 1,
      type: "exercise",
      title: "운동",
      startTime: newStartTime,
      endTime: newEndTime,
      location: "",
      capacity: 0,
      isUnlimited: true,
    }

    setRounds([...rounds, newRound])
    setEditingRound(rounds.length)
    setIsNewRound(true)
    setSheetOpen(true)
  }

  const removeRound = (index: number) => {
    if (rounds.length <= 1) return
    const newRounds = rounds.filter((_, i) => i !== index)
    setRounds(newRounds.map((r, i) => ({ ...r, roundNumber: i + 1 })))
  }

  const updateRound = (index: number, updates: Partial<RoundInput>) => {
    setRounds(rounds.map((r, i) => (i === index ? { ...r, ...updates } : r)))
  }

  const openRoundEditor = (index: number) => {
    setEditingRound(index)
    setIsNewRound(false)
    setSheetOpen(true)
  }

  const handleSheetClose = (open: boolean) => {
    if (!open) {
      if (isNewRound && editingRound !== null) {
        const round = rounds[editingRound]
        if (!round?.location.trim()) {
          const indexToRemove = editingRound
          setEditingRound(null)
          removeRound(indexToRemove)
        }
      }
      setEditingRound(null)
      setIsNewRound(false)
    }
    setSheetOpen(open)
  }

  const currentRound = editingRound !== null ? rounds[editingRound] : null
  const startHour = currentRound ? parseTime(currentRound.startTime).hour : 19
  const startMinute = currentRound ? parseTime(currentRound.startTime).minute : 0
  const endHour = currentRound ? parseTime(currentRound.endTime).hour : 21
  const endMinute = currentRound ? parseTime(currentRound.endTime).minute : 0

  const availableStartHours = useMemo(() => {
    return HOUR_OPTIONS.filter((h) => h < endHour || (h === endHour && startMinute < endMinute))
  }, [endHour, endMinute, startMinute])

  const availableStartMinutes = useMemo(() => {
    if (startHour < endHour) return MINUTE_OPTIONS
    return MINUTE_OPTIONS.filter((m) => m < endMinute)
  }, [startHour, endHour, endMinute])

  const availableEndHours = useMemo(() => {
    return HOUR_OPTIONS.filter((h) => h > startHour || (h === startHour && endMinute > startMinute))
  }, [startHour, startMinute, endMinute])

  const availableEndMinutes = useMemo(() => {
    if (endHour > startHour) return MINUTE_OPTIONS
    return MINUTE_OPTIONS.filter((m) => m > startMinute)
  }, [endHour, startHour, startMinute])

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-background">
        <header className="sticky top-0 z-10 border-b border-border bg-background">
          <div className="flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-lg" />
            </div>
          </div>
        </header>
        <div className="flex-1 px-4 py-2 space-y-0">
          <div className="border-b border-border py-4">
            <Skeleton className="h-7 w-3/4 rounded-lg" />
          </div>
          <div className="flex items-center gap-3 border-b border-border py-4">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-9 w-40 rounded-md" />
          </div>
          <div className="flex gap-3 border-b border-border py-4">
            <Skeleton className="mt-0.5 h-5 w-5 shrink-0 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
            </div>
          </div>
          <div className="py-4">
            <div className="mb-3 flex items-center justify-between">
              <Skeleton className="h-4 w-16 rounded-lg" />
              <Skeleton className="h-3 w-8 rounded" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-24 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !schedule) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center gap-4 px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" aria-hidden />
        </div>
        <p className="text-sm font-medium text-destructive">일정을 불러올 수 없습니다</p>
        <p className="text-xs text-muted-foreground text-center">잠시 후 다시 시도해주세요</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => router.back()}>
            뒤로 가기
          </Button>
          <Button size="sm" onClick={() => refetch()}>
            다시 시도
          </Button>
        </div>
      </div>
    )
  }

  if (!schedule.canManage) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center gap-4 px-4">
        <p className="text-sm text-destructive">일정을 수정할 권한이 없습니다</p>
        <Button size="sm" onClick={() => router.back()}>
          뒤로 가기
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link
              href={`/crews/${crewId}/schedules/${scheduleId}`}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-accent"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="text-base font-medium">일정 수정</span>
          </div>
          <Button
            onClick={handleSaveClick}
            disabled={mutation.isPending}
            size="sm"
            variant="ghost"
            className="text-primary hover:text-primary"
          >
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            저장
          </Button>
        </div>
      </header>

      <div className="flex-1 px-4 py-2">
        <div className="border-b border-border py-4">
          <input
            type="text"
            placeholder="일정 제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            disabled={mutation.isPending}
            className="w-full bg-transparent text-lg font-medium placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
          />
        </div>

        <div className="flex items-center gap-3 border-b border-border py-4">
          <Clock className="h-5 w-5 shrink-0 text-muted-foreground" />
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={mutation.isPending}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent disabled:opacity-50"
              >
                {format(date, "yyyy. M. d. EEEE", { locale: ko })}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex gap-3 border-b border-border py-4">
          <AlignLeft className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <div className="flex-1">
            <Textarea
              placeholder="설명 추가 (선택)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={2}
              disabled={mutation.isPending}
              className="resize-none border-0 bg-transparent p-0 text-sm placeholder:text-muted-foreground focus-visible:ring-0"
            />
          </div>
        </div>

        <div className="py-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">일정</h3>
            <span className="text-xs text-muted-foreground">{rounds.length}/5</span>
          </div>

          <div className="space-y-3">
            {rounds.map((round, index) => {
              const config = ROUND_TYPE_CONFIG[round.type]
              const Icon = config.icon
              return (
                <div
                  key={index}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          {round.roundNumber}차 {round.title || config.defaultTitle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimeDisplay(round.startTime)} ~ {formatTimeDisplay(round.endTime)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openRoundEditor(index)}
                      >
                        <span className="text-xs text-primary">편집</span>
                      </Button>
                      {rounds.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeRound(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{round.location || "장소를 입력하세요"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{round.isUnlimited ? "정원 무관" : `정원 ${round.capacity}명`}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {rounds.length < 5 && (
            <Button
              variant="outline"
              className="mt-3 w-full rounded-xl"
              onClick={addRound}
              disabled={mutation.isPending}
            >
              <Plus className="mr-2 h-4 w-4" />
              일정 추가
            </Button>
          )}
        </div>

        {hasAttemptedSubmit && validation.errors.length > 0 && (
          <div className="space-y-2">
            {validation.errors.map((error, index) => (
              <div key={index} className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            ))}
          </div>
        )}

        {mutation.isError && (
          <div className="mt-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {mutation.error.message}
          </div>
        )}
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>일정을 수정하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              일정을 수정하면 기존 참석/대기 내역이 모두 초기화됩니다. 참석자들은
              다시 참석 신청을 해야 합니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSubmit}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              수정하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={sheetOpen} onOpenChange={handleSheetClose}>
        <SheetContent side="bottom" className="h-auto max-h-[85vh] rounded-t-3xl pb-safe">
          <SheetHeader className="pb-2">
            <SheetTitle className="text-center text-lg">
              {currentRound && `${currentRound.roundNumber}차 일정 편집`}
            </SheetTitle>
          </SheetHeader>

          {currentRound && editingRound !== null && (
            <div className="space-y-5 overflow-y-auto px-1 pb-4">
              <div className="grid grid-cols-4 gap-2">
                {(Object.entries(ROUND_TYPE_CONFIG) as [RoundType, typeof ROUND_TYPE_CONFIG["exercise"]][]).map(
                  ([type, config]) => {
                    const Icon = config.icon
                    const isSelected = currentRound.type === type
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          updateRound(editingRound, {
                            type,
                            title: type === "other" ? "" : config.defaultTitle,
                          })
                        }}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 transition-all",
                          isSelected
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-transparent bg-muted/50 hover:bg-muted"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-xl",
                            isSelected ? "bg-primary/20" : "bg-background"
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-5 w-5",
                              isSelected ? "text-primary" : "text-muted-foreground"
                            )}
                          />
                        </div>
                        <span
                          className={cn(
                            "text-xs font-medium",
                            isSelected ? "text-primary" : "text-muted-foreground"
                          )}
                        >
                          {config.label}
                        </span>
                      </button>
                    )
                  }
                )}
              </div>

              {currentRound.type === "other" && (
                <div className="rounded-2xl bg-muted/30 p-4">
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <AlignLeft className="h-4 w-4" />
                    제목
                  </label>
                  <Input
                    placeholder="일정 제목을 입력하세요"
                    value={currentRound.title}
                    onChange={(e) => updateRound(editingRound, { title: e.target.value })}
                    maxLength={50}
                    className="border-0 bg-background"
                  />
                </div>
              )}

              <div className="rounded-2xl bg-muted/30 p-4">
                <label className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  시간
                </label>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-1 items-center gap-1.5">
                    <Popover open={startHourOpen} onOpenChange={setStartHourOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="flex-1 rounded-xl bg-background px-3 py-2.5 text-center text-sm font-medium transition-colors hover:bg-accent"
                        >
                          {startHour >= 24 ? `+${startHour - 24}` : startHour}시
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-20 p-0" align="center">
                        <ScrollArea className="h-48">
                          <div className="p-1">
                            {availableStartHours.map((h) => (
                              <div
                                key={h}
                                role="button"
                                tabIndex={0}
                                onClick={() => {
                                  updateRound(editingRound, { startTime: formatTimeStr(h, startMinute) })
                                  setStartHourOpen(false)
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    updateRound(editingRound, { startTime: formatTimeStr(h, startMinute) })
                                    setStartHourOpen(false)
                                  }
                                }}
                                className={cn(
                                  "cursor-pointer rounded-lg px-3 py-2 text-center text-sm hover:bg-accent",
                                  startHour === h && "bg-primary/10 font-medium text-primary"
                                )}
                              >
                                {h >= 24 ? `+${h - 24}` : h}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>
                    <Popover open={startMinuteOpen} onOpenChange={setStartMinuteOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="flex-1 rounded-xl bg-background px-3 py-2.5 text-center text-sm font-medium transition-colors hover:bg-accent"
                        >
                          {startMinute.toString().padStart(2, "0")}분
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-20 p-0" align="center">
                        <ScrollArea className="h-48">
                          <div className="p-1">
                            {availableStartMinutes.map((m) => (
                              <div
                                key={m}
                                role="button"
                                tabIndex={0}
                                onClick={() => {
                                  updateRound(editingRound, { startTime: formatTimeStr(startHour, m) })
                                  setStartMinuteOpen(false)
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    updateRound(editingRound, { startTime: formatTimeStr(startHour, m) })
                                    setStartMinuteOpen(false)
                                  }
                                }}
                                className={cn(
                                  "cursor-pointer rounded-lg px-3 py-2 text-center text-sm hover:bg-accent",
                                  startMinute === m && "bg-primary/10 font-medium text-primary"
                                )}
                              >
                                {m.toString().padStart(2, "0")}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <span className="text-muted-foreground">~</span>

                  <div className="flex flex-1 items-center gap-1.5">
                    <Popover open={endHourOpen} onOpenChange={setEndHourOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="flex-1 rounded-xl bg-background px-3 py-2.5 text-center text-sm font-medium transition-colors hover:bg-accent"
                        >
                          {endHour >= 24 ? `+${endHour - 24}` : endHour}시
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-20 p-0" align="center">
                        <ScrollArea className="h-48">
                          <div className="p-1">
                            {availableEndHours.map((h) => (
                              <div
                                key={h}
                                role="button"
                                tabIndex={0}
                                onClick={() => {
                                  updateRound(editingRound, { endTime: formatTimeStr(h, endMinute) })
                                  setEndHourOpen(false)
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    updateRound(editingRound, { endTime: formatTimeStr(h, endMinute) })
                                    setEndHourOpen(false)
                                  }
                                }}
                                className={cn(
                                  "cursor-pointer rounded-lg px-3 py-2 text-center text-sm hover:bg-accent",
                                  endHour === h && "bg-primary/10 font-medium text-primary"
                                )}
                              >
                                {h >= 24 ? `+${h - 24}` : h}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>
                    <Popover open={endMinuteOpen} onOpenChange={setEndMinuteOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="flex-1 rounded-xl bg-background px-3 py-2.5 text-center text-sm font-medium transition-colors hover:bg-accent"
                        >
                          {endMinute.toString().padStart(2, "0")}분
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-20 p-0" align="center">
                        <ScrollArea className="h-48">
                          <div className="p-1">
                            {availableEndMinutes.map((m) => (
                              <div
                                key={m}
                                role="button"
                                tabIndex={0}
                                onClick={() => {
                                  updateRound(editingRound, { endTime: formatTimeStr(endHour, m) })
                                  setEndMinuteOpen(false)
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    updateRound(editingRound, { endTime: formatTimeStr(endHour, m) })
                                    setEndMinuteOpen(false)
                                  }
                                }}
                                className={cn(
                                  "cursor-pointer rounded-lg px-3 py-2 text-center text-sm hover:bg-accent",
                                  endMinute === m && "bg-primary/10 font-medium text-primary"
                                )}
                              >
                                {m.toString().padStart(2, "0")}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-muted/30 p-4">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  장소
                </label>
                <LocationSearch
                  value={currentRound.location}
                  onChange={(value, place) =>
                    updateRound(editingRound, {
                      location: value,
                      placeInfo: place as PlaceInfo | undefined,
                    })
                  }
                  placeholder="장소를 검색하세요"
                  priorityCategory={currentRound.type === "exercise" ? "클라이밍" : undefined}
                />
              </div>

              <div className="rounded-2xl bg-muted/30 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Users className="h-4 w-4" />
                    정원
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">무제한</span>
                    <Switch
                      checked={currentRound.isUnlimited}
                      onCheckedChange={(checked) =>
                        updateRound(editingRound, { isUnlimited: checked })
                      }
                    />
                  </div>
                </div>
                {!currentRound.isUnlimited && (
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={currentRound.capacity}
                      onChange={(e) =>
                        updateRound(editingRound, {
                          capacity: Math.max(1, Math.min(100, parseInt(e.target.value) || 1)),
                        })
                      }
                      className="h-10 w-20 border-0 bg-background text-center text-base font-medium"
                    />
                    <span className="text-sm text-muted-foreground">명</span>
                  </div>
                )}
                {currentRound.isUnlimited && (
                  <p className="text-sm text-muted-foreground">인원 제한 없이 참여 가능합니다</p>
                )}
              </div>

              <Button
                className="w-full rounded-xl py-6 text-base font-semibold"
                onClick={() => setSheetOpen(false)}
              >
                완료
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}