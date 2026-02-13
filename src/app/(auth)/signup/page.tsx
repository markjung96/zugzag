'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { SignupForm } from '@/components/organisms/auth/signup-form'

export default function SignupPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-14 items-center border-b border-border bg-background px-4">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="뒤로 가기"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold">회원가입</h1>
        <div className="w-10" />
      </header>

      <div className="flex flex-1 items-center justify-center px-6 py-6">
        <div className="w-full max-w-sm">
          <SignupForm />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            이미 계정이 있나요?{' '}
            <Link
              href="/login"
              className="font-semibold text-primary transition-colors hover:text-primary/80"
            >
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
