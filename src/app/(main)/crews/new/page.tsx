'use client'

import { useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'
import { ArrowLeft, Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCreateCrewMutation } from '@/hooks/api/crews/use-create-crew-mutation'

export default function NewCrewPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const mutation = useCreateCrewMutation()

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      if (!name.trim()) {
        return
      }

      mutation.mutate(
        {
          name: name.trim(),
          description: description.trim() || undefined,
        },
        {
          onSuccess: (crew) => {
            router.push(`/crews/${crew.id}`)
          },
        }
      )
    },
    [name, description, mutation, router]
  )

  const isValid = name.trim().length > 0

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
          <h1 className="ml-2 text-lg font-bold">새 크루 만들기</h1>
        </div>
      </header>

      <div className="flex flex-1 flex-col px-4 py-6">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            새로운 클라이밍 크루를 만들어보세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">
              크루 이름
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="예: 클라이밍 크루"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              disabled={mutation.isPending}
              required
              className="h-12 rounded-xl border-input bg-background text-base"
            />
            <p className="text-right text-xs text-muted-foreground">
              {name.length}/50자
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">
              크루 소개 <span className="font-normal text-muted-foreground">(선택)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="크루에 대해 간단히 소개해주세요"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={4}
              disabled={mutation.isPending}
              className="rounded-xl border-input bg-background text-base"
            />
            <p className="text-right text-xs text-muted-foreground">
              {description.length}/500자
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
            {mutation.isPending ? '만드는 중...' : '크루 만들기'}
          </Button>
        </form>

        <div className="mt-auto pt-6">
          <div className="rounded-2xl border border-border bg-card p-4">
            <h3 className="mb-2 text-sm font-semibold">안내</h3>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                크루를 만들면 자동으로 크루장이 됩니다
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                크루장은 일정을 만들고 관리할 수 있습니다
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                초대 코드를 공유해서 멤버를 초대하세요
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
