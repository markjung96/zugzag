import { Dumbbell, Utensils, PartyPopper, MoreHorizontal } from "lucide-react"
import type { RoundType } from "@/types/schedule.types"

export interface RoundTypeConfig {
  label: string
  icon: typeof Dumbbell
  defaultTitle: string
}

export const ROUND_TYPE_CONFIG: Record<RoundType, RoundTypeConfig> = {
  exercise: { label: "운동", icon: Dumbbell, defaultTitle: "운동" },
  meal: { label: "식사", icon: Utensils, defaultTitle: "식사" },
  afterparty: { label: "뒷풀이", icon: PartyPopper, defaultTitle: "뒷풀이" },
  other: { label: "기타", icon: MoreHorizontal, defaultTitle: "" },
}
