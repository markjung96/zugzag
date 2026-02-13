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
  myRole: 'leader' | 'admin' | 'member'
  canManage: boolean
  inviteCode?: string
}

export interface CrewMember {
  id: string
  userId: string
  name: string
  email: string
  image: string | null
  role: 'leader' | 'admin' | 'member'
  joinedAt: string
}
