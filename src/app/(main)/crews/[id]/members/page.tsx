'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'
import {
  ArrowLeft,
  Users,
  Crown,
  Shield,
  User,
  MoreVertical,
  UserMinus,
  ShieldCheck,
  ShieldOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { useCrewQuery } from '@/hooks/api/crews/use-crew-query'
import { useCrewMembersQuery } from '@/hooks/api/crews/use-crew-members-query'
import { useUpdateMemberMutation } from '@/hooks/api/crews/use-update-member-mutation'
import { useRemoveMemberMutation } from '@/hooks/api/crews/use-remove-member-mutation'
import type { CrewMember } from '@/types/crew.types'

type Role = 'leader' | 'admin' | 'member'

const ROLE_CONFIG: Record<Role, { label: string; icon: typeof Crown; color: string }> = {
  leader: { label: '크루장', icon: Crown, color: 'text-amber-500' },
  admin: { label: '운영진', icon: Shield, color: 'text-primary' },
  member: { label: '멤버', icon: User, color: 'text-muted-foreground' },
}

export default function CrewMembersPage() {
  const params = useParams()
  const router = useRouter()
  const crewId = params.id as string

  const { data: crew, isLoading: crewLoading } = useCrewQuery(crewId)
  const { data: membersData, isLoading: membersLoading } = useCrewMembersQuery(crewId)

  const updateRoleMutation = useUpdateMemberMutation(crewId)
  const removeMemberMutation = useRemoveMemberMutation(crewId)

  const [kickTarget, setKickTarget] = useState<CrewMember | null>(null)

  const members = membersData?.members ?? []

  const handleKick = useCallback(() => {
    if (kickTarget) {
      removeMemberMutation.mutate(kickTarget.id, {
        onSuccess: () => setKickTarget(null),
      })
    }
  }, [kickTarget, removeMemberMutation])

  if (crewLoading || membersLoading) {
    return <LoadingState />
  }

  if (!crew) {
    router.push('/crews')
    return null
  }

  const isLeader = crew.myRole === 'leader'
  const sortedMembers = [...members].sort((a, b) => {
    const roleOrder = { leader: 0, admin: 1, member: 2 }
    return roleOrder[a.role] - roleOrder[b.role]
  })

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/crews/${crewId}`}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="뒤로 가기"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-bold">멤버 관리</h1>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">{members.length}명</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col px-4 py-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
            <Crown className="h-3 w-3" />
            크루장 1
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            <Shield className="h-3 w-3" />
            운영진 {members.filter((m) => m.role === 'admin').length}
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <User className="h-3 w-3" />
            멤버 {members.filter((m) => m.role === 'member').length}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {sortedMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              isLeader={isLeader}
              onRoleChange={(role) => updateRoleMutation.mutate({ memberId: member.id, role })}
              onKick={() => setKickTarget(member)}
              isUpdating={updateRoleMutation.isPending}
            />
          ))}
        </div>
      </div>

      <AlertDialog open={!!kickTarget} onOpenChange={(open) => !open && setKickTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>멤버 내보내기</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-semibold text-foreground">{kickTarget?.name}</span>님을 크루에서
              내보내시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleKick}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeMemberMutation.isPending ? '처리 중...' : '내보내기'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function MemberCard({
  member,
  isLeader,
  onRoleChange,
  onKick,
  isUpdating,
}: {
  member: CrewMember
  isLeader: boolean
  onRoleChange: (role: 'admin' | 'member') => void
  onKick: () => void
  isUpdating: boolean
}) {
  const roleConfig = ROLE_CONFIG[member.role]
  const RoleIcon = roleConfig.icon
  const canManageMember = isLeader && member.role !== 'leader'

  const joinedDate = new Date(member.joinedAt)
  const formattedDate = `${joinedDate.getFullYear()}.${String(joinedDate.getMonth() + 1).padStart(2, '0')}.${String(joinedDate.getDate()).padStart(2, '0')}`

  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/50">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-lg font-bold text-muted-foreground">
          {member.image ? (
            <img src={member.image} alt={member.name} className="h-full w-full rounded-full object-cover" />
          ) : (
            member.name.charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{member.name}</span>
            <div className={`flex items-center gap-1 ${roleConfig.color}`}>
              <RoleIcon className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{roleConfig.label}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{formattedDate} 가입</p>
        </div>
      </div>

      {canManageMember && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" disabled={isUpdating}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {member.role === 'member' ? (
              <DropdownMenuItem onClick={() => onRoleChange('admin')} className="gap-2">
                <ShieldCheck className="h-4 w-4" />
                운영진으로 승급
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => onRoleChange('member')} className="gap-2">
                <ShieldOff className="h-4 w-4" />
                멤버로 변경
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onKick} className="gap-2 text-destructive focus:text-destructive">
              <UserMinus className="h-4 w-4" />
              크루에서 내보내기
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex h-14 items-center gap-3 px-4">
          <div className="h-10 w-10 animate-pulse rounded-xl bg-muted" />
          <div className="h-5 w-24 animate-pulse rounded-lg bg-muted" />
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 px-4 py-5">
        <div className="flex gap-2">
          <div className="h-7 w-20 animate-pulse rounded-full bg-muted" />
          <div className="h-7 w-20 animate-pulse rounded-full bg-muted" />
          <div className="h-7 w-20 animate-pulse rounded-full bg-muted" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  )
}
