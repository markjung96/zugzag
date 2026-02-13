'use client'

import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'
import { ArrowLeft, UserPlus, Ticket } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useJoinCrewMutation } from '@/hooks/api/crews/use-join-crew-mutation'

export default function JoinCrewPage() {
  const router = useRouter()

  const [inviteCode, setInviteCode] = useState('')

  const mutation = useJoinCrewMutation()

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      const code = inviteCode.trim().toUpperCase()
      if (code.length !== 6) {
        return
      }

      mutation.mutate(code, {
        onSuccess: (crew) => {
          toast.success('크루에 가입되었습니다')
          router.push(`/crews/${crew.id}`)
        },
      })
    },
    [inviteCode, mutation, router]
  )

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    setInviteCode(value)
  }, [])

  const isValid = inviteCode.length === 6

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="flex h-14 items-center px-4">
          <Link
            href="/crews"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="뒤로 가기"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="ml-2 text-lg font-bold">크루 가입하기</h1>
        </div>
      </header>

      <div className="flex flex-1 flex-col px-4 py-6">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <UserPlus className="h-8 w-8 text-primary" />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            초대 코드를 입력하여 크루에 가입하세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="inviteCode" className="text-sm font-semibold">
              <span className="flex items-center gap-1.5">
                <Ticket className="h-4 w-4" />
                초대 코드
              </span>
            </Label>
            <Input
              id="inviteCode"
              type="text"
              placeholder="XXXXXX"
              value={inviteCode}
              onChange={handleInputChange}
              maxLength={6}
              disabled={mutation.isPending}
              className="h-14 rounded-xl border-input bg-background text-center font-mono text-2xl tracking-[0.5em]"
              required
              autoComplete="off"
            />
            <p className="text-center text-xs text-muted-foreground">
              6자리 영문/숫자 코드
            </p>
          </div>

          {mutation.isError && (
            <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
              {mutation.error.message}
            </div>
          )}

          <Button
            type="submit"
            className="h-12 w-full rounded-xl text-base font-semibold shadow-md transition-shadow hover:shadow-lg"
            disabled={!isValid || mutation.isPending}
          >
            {mutation.isPending ? '가입 중...' : '크루 가입하기'}
          </Button>
        </form>

        <div className="mt-auto pt-6">
          <div className="rounded-2xl border border-border bg-card p-4">
            <h3 className="mb-2 text-sm font-semibold">초대 코드는 어디서 받나요?</h3>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                크루장에게 초대 코드를 요청하세요
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                크루장은 크루 설정에서 코드를 확인할 수 있어요
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                대소문자를 구분하지 않아요
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
