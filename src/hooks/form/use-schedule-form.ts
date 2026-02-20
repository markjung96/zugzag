import { useState, useMemo, useCallback } from 'react'
import type { RoundType } from '@/types/schedule.types'

export interface RoundInput {
  type: RoundType
  time: string
  capacity: number
  placeName?: string
  placeAddress?: string
}

const defaultRound: RoundInput = {
  type: 'exercise',
  time: '19:00',
  capacity: 0,
}

export function useScheduleForm(initialData?: {
  title?: string
  description?: string
  date?: Date
  rounds?: RoundInput[]
}) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [date, setDate] = useState<Date>(initialData?.date ?? new Date())
  const [rounds, setRounds] = useState<RoundInput[]>(initialData?.rounds ?? [defaultRound])

  const validation = useMemo(() => ({
    isValid: title.trim().length > 0 && rounds.length > 0,
    errors: {
      title: !title.trim() ? '제목을 입력하세요' : null,
      rounds: rounds.length === 0 ? '최소 1개의 라운드가 필요합니다' : null,
    },
  }), [title, rounds])

  const addRound = useCallback(() => {
    if (rounds.length < 5) {
      setRounds(prev => [...prev, { ...defaultRound }])
    }
  }, [rounds.length])

  const removeRound = useCallback((index: number) => {
    setRounds(prev => prev.filter((_, i) => i !== index))
  }, [])

  const updateRound = useCallback((index: number, updates: Partial<RoundInput>) => {
    setRounds(prev => prev.map((round, i) =>
      i === index ? { ...round, ...updates } : round
    ))
  }, [])

  const reset = useCallback(() => {
    setTitle(initialData?.title ?? '')
    setDescription(initialData?.description ?? '')
    setDate(initialData?.date ?? new Date())
    setRounds(initialData?.rounds ?? [defaultRound])
  }, [initialData])

  return {
    title, setTitle,
    description, setDescription,
    date, setDate,
    rounds,
    validation,
    addRound,
    removeRound,
    updateRound,
    reset,
  }
}
