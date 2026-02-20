"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useMemo } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeft,
  Clock,
  Loader2,
  MapPin,
  Users,
  AlignLeft,
  Plus,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { LocationSearch } from "@/components/location-search"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/utils/get-error-message"
import { schedulesQueryKey } from "@/hooks/api/schedules/use-schedules-query"
import { crewSchedulesQueryKey } from "@/hooks/api/crews/use-crew-schedules-query"
import { ROUND_TYPE_CONFIG } from "@/lib/constants/round"
import type { RoundType, PlaceInfo } from "@/types/schedule.types"

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

type CreateScheduleInput = {
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

async function createSchedule(crewId: string, data: CreateScheduleInput) {
  const res = await fetch(`/api/crews/${crewId}/schedules`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string; code?: string }
    const err = new Error(data.error ?? "일정 생성에 실패했습니다") as Error & { code?: string }
    err.code = data.code
    throw err
  }

  return res.json()
}

const HOUR_OPTIONS = Array.from({ length: 22 }, (_, i) => i + 6) // 6 ~ 27 (다음날 3시까지)
const MINUTE_OPTIONS = Array.from({ length: 12 }, (_, i) => i * 5) // 0, 5, 10, ... 55

function parseTime(time: string): { hour: number; minute: number } {
  const [h, m] = time.split(":").map(Number)
  return { hour: h, minute: m }
}

function formatTime(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
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

export function NewScheduleContent() {
  const { id: crewId } = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: CreateScheduleInput) => createSchedule(crewId, data),
    onError: (error) => {
      toast.error(getErrorMessage(error), { duration: 4000 })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulesQueryKey() })
      queryClient.invalidateQueries({ queryKey: crewSchedulesQueryKey(crewId) })
      router.push(`/crews/${crewId}`)
    },
  })

  const [title, setTitle] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [description, setDescription] = useState("")
  const [rounds, setRounds] = useState<RoundInput[]>([
    {
      roundNumber: 1,
      type: "exercise",
      title: "운동",
      startTime: "19:00",
      endTime: "21:00",
      location: "",
      capacity: 0,
      isUnlimited: true,
    },
  ])
  const [editingRound, setEditingRound] = useState<number | null>(0)
  const [isNewRound, setIsNewRound] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isStartHourOpen, setIsStartHourOpen] = useState(false)
  const [isStartMinuteOpen, setIsStartMinuteOpen] = useState(false)
  const [isEndHourOpen, setIsEndHourOpen] = useState(false)
  const [isEndMinuteOpen, setIsEndMinuteOpen] = useState(false)
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

  const currentRound = editingRound !== null ? rounds[editingRound] : null

  const startHour = currentRound ? parseTime(currentRound.startTime).hour : 19
  const startMinute = currentRound ? parseTime(currentRound.startTime).minute : 0
  const endHour = currentRound ? parseTime(currentRound.endTime).hour : 21
  const endMinute = currentRound ? parseTime(currentRound.endTime).minute : 0

  const validation = useMemo(() => {
    const errors: string[] = []

    if (!title.trim()) {
      errors.push("일정 제목을 입력해주세요")
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date < today) {
      errors.push("오늘 이후의 날짜를 선택해주세요")
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
  }, [title, date, rounds])

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

  const handleSubmit = () => {
    setHasAttemptedSubmit(true)
    if (!validation.isValid) return

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
    const newStartTime = lastRound.endTime
    const { hour, minute } = parseTime(newStartTime)
    const newEndHour = Math.min(hour + 2, 27)
    const newEndTime = formatTime(newEndHour, minute)

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
    setIsSheetOpen(true)
  }

  const removeRound = (index: number) => {
    if (rounds.length <= 1) return
    const newRounds = rounds.filter((_, i) => i !== index)
    setRounds(
      newRounds.map((r, i) => ({ ...r, roundNumber: i + 1 }))
    )
  }

  const updateRound = (index: number, updates: Partial<RoundInput>) => {
    setRounds(
      rounds.map((r, i) => (i === index ? { ...r, ...updates } : r))
    )
  }

  const openRoundEditor = (index: number) => {
    setEditingRound(index)
    setIsNewRound(false)
    setIsSheetOpen(true)
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
    setIsSheetOpen(open)
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link
              href={`/crews/${crewId}`}
              className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-accent"
              aria-label="뒤로 가기"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="text-base font-medium">새 일정</span>
          </div>
          <Button
            onClick={handleSubmit}
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
                disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
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

      <Sheet open={isSheetOpen} onOpenChange={handleSheetClose}>
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
                    <Popover open={isStartHourOpen} onOpenChange={setIsStartHourOpen}>
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
                                  updateRound(editingRound, { startTime: formatTime(h, startMinute) })
                                  setIsStartHourOpen(false)
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    updateRound(editingRound, { startTime: formatTime(h, startMinute) })
                                    setIsStartHourOpen(false)
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
                    <Popover open={isStartMinuteOpen} onOpenChange={setIsStartMinuteOpen}>
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
                                  updateRound(editingRound, { startTime: formatTime(startHour, m) })
                                  setIsStartMinuteOpen(false)
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    updateRound(editingRound, { startTime: formatTime(startHour, m) })
                                    setIsStartMinuteOpen(false)
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
                    <Popover open={isEndHourOpen} onOpenChange={setIsEndHourOpen}>
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
                                  updateRound(editingRound, { endTime: formatTime(h, endMinute) })
                                  setIsEndHourOpen(false)
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    updateRound(editingRound, { endTime: formatTime(h, endMinute) })
                                    setIsEndHourOpen(false)
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
                    <Popover open={isEndMinuteOpen} onOpenChange={setIsEndMinuteOpen}>
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
                                  updateRound(editingRound, { endTime: formatTime(endHour, m) })
                                  setIsEndMinuteOpen(false)
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    updateRound(editingRound, { endTime: formatTime(endHour, m) })
                                    setIsEndMinuteOpen(false)
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
                onClick={() => setIsSheetOpen(false)}
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
