'use client'

import { useMemo, useState } from 'react'
import {
  Clock,
  MapPin,
  Users,
  AlignLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { LocationSearch, type Place } from '@/components/location-search'
import { ROUND_TYPE_CONFIG } from '@/lib/constants/round'
import { cn } from '@/lib/utils'
import type { RoundType, PlaceInfo } from '@/types/schedule.types'

export interface RoundInput {
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

interface RoundEditorSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  round: RoundInput | null
  roundIndex: number | null
  onUpdateRound: (index: number, updates: Partial<RoundInput>) => void
}

const HOUR_OPTIONS = Array.from({ length: 22 }, (_, i) => i + 6)
const MINUTE_OPTIONS = Array.from({ length: 12 }, (_, i) => i * 5)

function parseTime(time: string): { hour: number; minute: number } {
  const [h, m] = time.split(':').map(Number)
  return { hour: h, minute: m }
}

function formatTimeValue(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}

export function RoundEditorSheet({
  open,
  onOpenChange,
  round,
  roundIndex,
  onUpdateRound,
}: RoundEditorSheetProps) {
  const [isStartHourOpen, setIsStartHourOpen] = useState(false)
  const [isStartMinuteOpen, setIsStartMinuteOpen] = useState(false)
  const [isEndHourOpen, setIsEndHourOpen] = useState(false)
  const [isEndMinuteOpen, setIsEndMinuteOpen] = useState(false)

  const startHour = round ? parseTime(round.startTime).hour : 19
  const startMinute = round ? parseTime(round.startTime).minute : 0
  const endHour = round ? parseTime(round.endTime).hour : 21
  const endMinute = round ? parseTime(round.endTime).minute : 0

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

  if (!round || roundIndex === null) return null

  const handleUpdate = (updates: Partial<RoundInput>) => {
    onUpdateRound(roundIndex, updates)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto max-h-[85vh] rounded-t-3xl pb-safe">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-center text-lg">
            {round.roundNumber}차 일정 편집
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5 overflow-y-auto px-1 pb-4">
          <div className="grid grid-cols-4 gap-2">
            {(Object.entries(ROUND_TYPE_CONFIG) as [RoundType, typeof ROUND_TYPE_CONFIG['exercise']][]).map(
              ([type, config]) => {
                const Icon = config.icon
                const isSelected = round.type === type
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      handleUpdate({
                        type,
                        title: type === 'other' ? '' : config.defaultTitle,
                      })
                    }}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 transition-all',
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : 'border-transparent bg-muted/50 hover:bg-muted'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-xl',
                        isSelected ? 'bg-primary/20' : 'bg-background'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-5 w-5',
                          isSelected ? 'text-primary' : 'text-muted-foreground'
                        )}
                      />
                    </div>
                    <span
                      className={cn(
                        'text-xs font-medium',
                        isSelected ? 'text-primary' : 'text-muted-foreground'
                      )}
                    >
                      {config.label}
                    </span>
                  </button>
                )
              }
            )}
          </div>

          {round.type === 'other' && (
            <div className="rounded-2xl bg-muted/30 p-4">
              <label htmlFor="round-title" className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <AlignLeft className="h-4 w-4" />
                제목
              </label>
              <Input
                id="round-title"
                placeholder="일정 제목을 입력하세요"
                value={round.title}
                onChange={(e) => handleUpdate({ title: e.target.value })}
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
                              handleUpdate({ startTime: formatTimeValue(h, startMinute) })
                              setIsStartHourOpen(false)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                handleUpdate({ startTime: formatTimeValue(h, startMinute) })
                                setIsStartHourOpen(false)
                              }
                            }}
                            className={cn(
                              'cursor-pointer rounded-lg px-3 py-2 text-center text-sm hover:bg-accent',
                              startHour === h && 'bg-primary/10 font-medium text-primary'
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
                      {startMinute.toString().padStart(2, '0')}분
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
                              handleUpdate({ startTime: formatTimeValue(startHour, m) })
                              setIsStartMinuteOpen(false)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                handleUpdate({ startTime: formatTimeValue(startHour, m) })
                                setIsStartMinuteOpen(false)
                              }
                            }}
                            className={cn(
                              'cursor-pointer rounded-lg px-3 py-2 text-center text-sm hover:bg-accent',
                              startMinute === m && 'bg-primary/10 font-medium text-primary'
                            )}
                          >
                            {m.toString().padStart(2, '0')}
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
                              handleUpdate({ endTime: formatTimeValue(h, endMinute) })
                              setIsEndHourOpen(false)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                handleUpdate({ endTime: formatTimeValue(h, endMinute) })
                                setIsEndHourOpen(false)
                              }
                            }}
                            className={cn(
                              'cursor-pointer rounded-lg px-3 py-2 text-center text-sm hover:bg-accent',
                              endHour === h && 'bg-primary/10 font-medium text-primary'
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
                      {endMinute.toString().padStart(2, '0')}분
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
                              handleUpdate({ endTime: formatTimeValue(endHour, m) })
                              setIsEndMinuteOpen(false)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                handleUpdate({ endTime: formatTimeValue(endHour, m) })
                                setIsEndMinuteOpen(false)
                              }
                            }}
                            className={cn(
                              'cursor-pointer rounded-lg px-3 py-2 text-center text-sm hover:bg-accent',
                              endMinute === m && 'bg-primary/10 font-medium text-primary'
                            )}
                          >
                            {m.toString().padStart(2, '0')}
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
            <label htmlFor="round-location" className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <MapPin className="h-4 w-4" />
              장소
            </label>
            <LocationSearch
              id="round-location"
              value={round.location}
              onChange={(value, place) =>
                handleUpdate({
                  location: value,
                  placeInfo: place as PlaceInfo | undefined,
                })
              }
              placeholder="장소를 검색하세요"
              priorityCategory={round.type === 'exercise' ? '클라이밍' : undefined}
            />
          </div>

          <div className="rounded-2xl bg-muted/30 p-4">
            <div className="mb-3 flex items-center justify-between">
              <label htmlFor="round-capacity" className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Users className="h-4 w-4" />
                정원
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">무제한</span>
                <Switch
                  checked={round.isUnlimited}
                  onCheckedChange={(checked) =>
                    handleUpdate({ isUnlimited: checked })
                  }
                />
              </div>
            </div>
            {!round.isUnlimited && (
              <div className="flex items-center gap-3">
                <Input
                  id="round-capacity"
                  type="number"
                  min={1}
                  max={100}
                  value={round.capacity}
                  onChange={(e) =>
                    handleUpdate({
                      capacity: Math.max(1, Math.min(100, parseInt(e.target.value) || 1)),
                    })
                  }
                  className="h-10 w-20 border-0 bg-background text-center text-base font-medium"
                />
                <span className="text-sm text-muted-foreground">명</span>
              </div>
            )}
            {round.isUnlimited && (
              <p className="text-sm text-muted-foreground">인원 제한 없이 참여 가능합니다</p>
            )}
          </div>

          <Button
            className="w-full rounded-xl py-6 text-base font-semibold"
            onClick={() => onOpenChange(false)}
          >
            완료
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
