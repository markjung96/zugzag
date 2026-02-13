'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  ArrowLeft,
  Copy,
  Check,
  Share2,
  Users,
  Crown,
  Trash2,
  UserMinus,
  Settings,
  Link as LinkIcon,
  Info,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useCrewQuery } from '@/hooks/api/crews/use-crew-query'
import { useCrewMembersQuery } from '@/hooks/api/crews/use-crew-members-query'
import { useUpdateCrewMutation } from '@/hooks/api/crews/use-update-crew-mutation'
import { useDeleteCrewMutation } from '@/hooks/api/crews/use-delete-crew-mutation'
import { useRemoveMemberMutation } from '@/hooks/api/crews/use-remove-member-mutation'
import { useRegenerateInviteCodeMutation } from '@/hooks/api/crews/use-regenerate-invite-code-mutation'
import { useClipboard } from '@/hooks/common/use-clipboard'
import { toast } from 'sonner'
import type { CrewMember } from '@/types/crew.types'

export default function CrewSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const crewId = params.id as string

  const { data: crew, isLoading: crewLoading, error: crewError } = useCrewQuery(crewId)
  const { data: membersData, isLoading: membersLoading } = useCrewMembersQuery(crewId)

  const updateMutation = useUpdateCrewMutation(crewId)
  const deleteMutation = useDeleteCrewMutation()
  const removeMemberMutation = useRemoveMemberMutation(crewId)
  const regenerateCodeMutation = useRegenerateInviteCodeMutation(crewId)

  const { copied, copy } = useClipboard()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '' })

  const isLoading = crewLoading || membersLoading
  const members = membersData?.members ?? []

  if (isLoading) {
    return <LoadingState crewId={crewId} />
  }

  if (crewError || !crew) {
    return <ErrorState crewId={crewId} />
  }

  if (formData.name === '' && crew) {
    setFormData({
      name: crew.name,
      description: crew.description || '',
    })
  }

  const leader = members.find((m) => m.role === 'leader')
  const memberList = members.filter((m) => m.role !== 'leader')

  const handleCopyInviteCode = () => {
    if (crew.inviteCode) {
      copy(crew.inviteCode)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${crew.name} 크루 초대`,
        text: `초대 코드: ${crew.inviteCode}`,
      })
    } else if (crew.inviteCode) {
      copy(crew.inviteCode)
    }
  }

  const handleSave = () => {
    if (!formData.name.trim()) return
    updateMutation.mutate(
      {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      },
      {
        onSuccess: () => {
          setIsEditing(false)
          toast.success('크루 정보가 저장되었습니다')
        },
      }
    )
  }

  const handleDelete = () => {
    deleteMutation.mutate(crewId, {
      onSuccess: () => {
        toast.success('크루가 삭제되었습니다')
        router.push('/crews')
      },
    })
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex h-14 items-center px-4">
          <Link
            href={`/crews/${crewId}`}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="뒤로 가기"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="ml-2 flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold">크루 설정</h1>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 px-4 py-5">
        {crew.inviteCode && (
          <section>
            <div className="mb-3 flex items-center gap-2 px-1">
              <LinkIcon className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-muted-foreground">초대 코드</h2>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card to-card/80">
              <div className="border-b border-border/50 bg-muted/30 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">활성화됨</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-3xl font-bold tracking-[0.3em] text-primary">{crew.inviteCode}</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCopyInviteCode}
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 rounded-xl border-2 transition-all hover:border-primary hover:bg-primary/5"
                    >
                      {copied ? <Check className="h-5 w-5 text-success" /> : <Copy className="h-5 w-5" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 rounded-xl border-2 transition-all hover:border-primary hover:bg-primary/5"
                      onClick={handleShare}
                    >
                      <Share2 className="h-5 w-5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-11 w-11 rounded-xl border-2 transition-all hover:border-primary hover:bg-primary/5"
                          disabled={regenerateCodeMutation.isPending}
                          aria-label="초대 코드 재생성"
                        >
                          <RefreshCw
                            className={`h-5 w-5 ${regenerateCodeMutation.isPending ? 'animate-spin' : ''}`}
                          />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>초대 코드를 재생성하시겠습니까?</AlertDialogTitle>
                          <AlertDialogDescription>
                            초대 코드를 재생성하면 기존 코드는 무효화됩니다. 계속하시겠습니까?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">취소</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => regenerateCodeMutation.mutate(undefined, {
                              onSuccess: () => toast.success('초대 코드가 재생성되었습니다'),
                            })}
                            className="rounded-xl"
                          >
                            재생성
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                {copied && <p className="mt-3 text-sm font-medium text-success">클립보드에 복사되었습니다</p>}
              </div>
            </div>
          </section>
        )}

        <section>
          <div className="mb-3 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-muted-foreground">크루 정보</h2>
            </div>
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-8 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10"
              >
                수정
              </Button>
            )}
          </div>
          <div className="overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/30">
            {isEditing ? (
              <div className="space-y-4 p-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold">
                    크루 이름
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="h-12 rounded-xl border-2 transition-colors focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold">
                    크루 소개
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    className="rounded-xl border-2 transition-colors focus:border-primary"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      setFormData({
                        name: crew.name,
                        description: crew.description || '',
                      })
                    }}
                    className="h-12 flex-1 rounded-xl border-2"
                  >
                    취소
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={updateMutation.isPending || !formData.name.trim()}
                    className="h-12 flex-1 rounded-xl shadow-lg shadow-primary/25"
                  >
                    {updateMutation.isPending ? '저장 중...' : '저장'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-5">
                <p className="text-lg font-bold">{crew.name}</p>
                {crew.description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{crew.description}</p>
                )}
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2 px-1">
            <Users className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-muted-foreground">멤버</h2>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
              {members.length}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {leader && <MemberItem member={leader} isLeader />}
            {memberList.map((member) => (
              <MemberItem
                key={member.id}
                member={member}
                onRemove={() => removeMemberMutation.mutate(member.id)}
                isRemoving={removeMemberMutation.isPending}
              />
            ))}
          </div>
        </section>

        <section className="mt-auto pt-4">
          <div className="mb-3 flex items-center gap-2 px-1">
            <Trash2 className="h-4 w-4 text-destructive" />
            <h2 className="text-sm font-semibold text-muted-foreground">위험 구역</h2>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="h-14 w-full justify-start gap-4 rounded-2xl border-2 border-destructive/30 bg-card px-4 text-base font-semibold text-destructive transition-all hover:border-destructive hover:bg-destructive/10"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
                  <Trash2 className="h-5 w-5" />
                </div>
                크루 삭제
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>크루를 삭제하시겠습니까?</AlertDialogTitle>
                <AlertDialogDescription>
                  이 작업은 되돌릴 수 없습니다. 모든 일정과 멤버 정보가 삭제됩니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">취소</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  삭제
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>
      </div>
    </div>
  )
}

function MemberItem({
  member,
  isLeader,
  onRemove,
  isRemoving,
}: {
  member: CrewMember
  isLeader?: boolean
  onRemove?: () => void
  isRemoving?: boolean
}) {
  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-sm font-bold text-primary">
        {member.image ? (
          <Image src={member.image} alt={member.name} width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
        ) : (
          member.name.charAt(0).toUpperCase()
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-bold">{member.name}</p>
          {isLeader && (
            <span className="flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-xs font-semibold text-warning">
              <Crown className="h-3 w-3" />
              크루장
            </span>
          )}
        </div>
        {!isLeader && <p className="text-sm text-muted-foreground">멤버</p>}
      </div>
      {!isLeader && onRemove && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
              disabled={isRemoving}
            >
              <UserMinus className="h-5 w-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>멤버를 내보내시겠습니까?</AlertDialogTitle>
              <AlertDialogDescription>{member.name}님을 크루에서 내보냅니다.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={onRemove}
                className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                내보내기
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}

function LoadingState({ crewId }: { crewId: string }) {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex h-14 items-center px-4">
          <Link
            href={`/crews/${crewId}`}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="ml-2 flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-20 rounded-lg" />
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-6 px-4 py-5">
        <div className="flex justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
            <p className="text-sm font-medium text-muted-foreground">설정을 불러오는 중...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ErrorState({ crewId }: { crewId: string }) {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex h-14 items-center px-4">
          <Link
            href={`/crews/${crewId}`}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="ml-2 flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold">크루 설정</h1>
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-destructive/10">
          <svg className="h-12 w-12 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="mb-2 text-lg font-bold text-destructive">설정을 불러올 수 없습니다</h3>
          <p className="text-sm text-muted-foreground">크루장만 접근할 수 있습니다</p>
        </div>
        <Button onClick={() => window.location.reload()} className="rounded-xl px-5">
          다시 시도
        </Button>
      </div>
    </div>
  )
}
