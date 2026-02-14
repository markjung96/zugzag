'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SignupForm } from '@/components/organisms/auth/signup-form'

export default function SignupPage() {
  const [isFormLoading, setIsFormLoading] = useState(false)

  const handleGoogleSignup = () => {
    signIn('google', { callbackUrl: '/crews' })
  }

  const handleKakaoSignup = () => {
    signIn('kakao', { callbackUrl: '/crews' })
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pb-safe">
      <header className="sticky top-0 z-10 flex h-14 items-center border-b border-border bg-background px-4 pr-14">
        <Link
          href="/login"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="뒤로 가기"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="flex-1 text-center text-lg font-bold">회원가입</h1>
        <div className="w-10" />
      </header>

      <div className="flex flex-1 items-center justify-center px-6 py-6">
        <div className="w-full max-w-sm">
          <SignupForm onLoadingChange={setIsFormLoading} />

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground">또는</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="h-12 w-full rounded-xl border-input bg-background text-base font-medium transition-colors hover:border-primary/50 hover:bg-primary/5"
              onClick={handleGoogleSignup}
              aria-label="Google로 회원가입"
              disabled={isFormLoading}
            >
              <svg className="mr-2.5 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google로 시작하기
            </Button>

            <Button
              type="button"
              variant="outline"
              className="h-12 w-full rounded-xl border-input bg-background text-base font-medium transition-colors hover:border-[#FEE500] hover:bg-[#FEE500]/10"
              onClick={handleKakaoSignup}
              aria-label="카카오로 회원가입"
              disabled={isFormLoading}
            >
              <svg
                className="mr-2.5 h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" />
              </svg>
              카카오로 시작하기
            </Button>
          </div>

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
