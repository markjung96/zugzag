export type RoundType = 'exercise' | 'meal' | 'afterparty' | 'other'

export interface Attendee {
  id: string
  name: string
  image: string | null
  status: 'attending' | 'waiting'
}

export interface Round {
  id: string
  roundNumber: number
  type: RoundType
  time: string | null
  capacity: number
  placeName: string | null
  placeAddress: string | null
  attendees: Attendee[]
  waitlist: Attendee[]
  userRsvpStatus: 'attending' | 'waiting' | null
}

export interface ScheduleDetail {
  id: string
  title: string
  description: string | null
  date: string
  crewId: string
  crewName: string
  rounds: Round[]
  isLeader: boolean
  isAdmin: boolean
}

export interface Schedule {
  id: string
  title: string
  description: string | null
  date: string
  crewId: string
  crewName: string
}

export interface ScheduleListItem extends Schedule {
  startTime: string
  endTime: string
  location: string
  capacity: number
  attendingCount: number
  myStatus: 'attending' | 'waiting' | null
  roundCount: number
}

export interface ScheduleRoundListItem {
  id: string
  roundNumber: number
  type: RoundType
  title: string
  startTime: string
  endTime: string
  location: string
  capacity: number
}

export interface PlaceInfo {
  id: string
  name: string
  address: string
  category?: string
  phone?: string
  x: string
  y: string
  url?: string
}

export interface CrewScheduleListItem {
  id: string
  title: string
  date: string
  description: string | null
  crewId: string
  createdBy: string
  rounds: ScheduleRoundListItem[]
  startTime: string
  endTime: string
  location: string
  capacity: number
  attendingCount: number
  myStatus: 'attending' | 'waiting' | null
  roundCount: number
}
