export type Role = 'leader' | 'admin' | 'member'

export interface Crew {
  id: string
  name: string
  description: string | null
  inviteCode: string
  memberCount: number
  isLeader: boolean
}

export interface CrewDetail {
  id: string
  name: string
  description: string | null
  leaderId: string
  memberCount: number
  myRole: Role
  canManage: boolean
  inviteCode?: string
}

export interface CrewMember {
  id: string
  userId: string
  name: string
  email: string
  image: string | null
  role: Role
  joinedAt: string
}
