'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Eye, EyeOff, Check, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { signIn } from 'next-auth/react'
import { getErrorMessage } from '@/lib/utils/get-error-message'

interface SignupFormProps {
  redirectUrl?: string
  onLoadingChange?: (loading: boolean) => void
}

export function SignupForm({ redirectUrl = '/crews', onLoadingChange }: SignupFormProps) {
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
  })
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false)

  const passwordsMatch =
    formData.password.length > 0 &&
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword

  const passwordMismatch =
    formData.confirmPassword.length > 0 &&
    formData.password !== formData.confirmPassword

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!passwordsMatch || !agreedToTerms || !agreedToPrivacy) return

      setIsLoading(true)
      setError('')

      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.nickname,
            agreedToTerms: true,
            agreedToPrivacy: true,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || '회원가입에 실패했습니다')
          setIsLoading(false)
          return
        }

        const signInResult = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })

        if (signInResult?.error) {
          setError('회원가입은 성공했으나 로그인에 실패했습니다')
          setIsLoading(false)
          return
        }

        router.push(redirectUrl)
      } catch (err) {
        console.error('Signup error:', err)
        setError(getErrorMessage(err))
        setIsLoading(false)
      }
    },
    [formData, passwordsMatch, agreedToTerms, agreedToPrivacy, router, redirectUrl]
  )

  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  const toggleConfirmPassword = useCallback(() => {
    setShowConfirmPassword((prev) => !prev)
  }, [])

  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading, onLoadingChange])

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div role="alert" className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold">
            이메일
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              autoFocus
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              className="h-12 rounded-xl border-input bg-background pl-11 text-base"
              required
              disabled={isLoading}
              autoComplete="email"
              inputMode="email"
              spellCheck={false}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-semibold">
            비밀번호
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="8자 이상"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              className="h-12 rounded-xl border-input bg-background pl-11 pr-11 text-base"
              required
              minLength={8}
              disabled={isLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={togglePassword}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-semibold">
            비밀번호 확인
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="비밀번호 재입력"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              className={`h-12 rounded-xl border-input bg-background pl-11 pr-11 text-base ${
                passwordMismatch ? 'border-destructive' : ''
              } ${passwordsMatch ? 'border-success' : ''}`}
              required
              minLength={8}
              disabled={isLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={toggleConfirmPassword}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
              aria-label={
                showConfirmPassword ? '비밀번호 숨기기' : '비밀번호 보기'
              }
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {formData.confirmPassword.length > 0 && (
            <div className="flex items-center gap-1.5 text-sm">
              {passwordsMatch ? (
                <>
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-success">비밀번호가 일치합니다</span>
                </>
              ) : (
                <>
                  <X className="h-4 w-4 text-destructive" />
                  <span className="text-destructive">
                    비밀번호가 일치하지 않습니다
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="nickname" className="text-sm font-semibold">
            닉네임
          </Label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="nickname"
              type="text"
              placeholder="크루에서 사용할 이름"
              value={formData.nickname}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, nickname: e.target.value }))
              }
              className="h-12 rounded-xl border-input bg-background pl-11 text-base"
              required
              minLength={2}
              maxLength={10}
              disabled={isLoading}
              autoComplete="name"
            />
          </div>
          <p className="text-sm text-muted-foreground">2-10자</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) =>
                setAgreedToTerms(checked === true)
              }
              disabled={isLoading}
              className="mt-0.5"
            />
            <Label
              htmlFor="terms"
              className="cursor-pointer text-sm leading-relaxed text-muted-foreground"
            >
              [필수]{' '}
              <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
              >
                이용약관
              </Link>
              에 동의합니다
            </Label>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox
              id="privacy"
              checked={agreedToPrivacy}
              onCheckedChange={(checked) =>
                setAgreedToPrivacy(checked === true)
              }
              disabled={isLoading}
              className="mt-0.5"
            />
            <Label
              htmlFor="privacy"
              className="cursor-pointer text-sm leading-relaxed text-muted-foreground"
            >
              [필수]{' '}
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
              >
                개인정보 처리방침
              </Link>
              에 동의합니다
            </Label>
          </div>
        </div>

        <Button
          type="submit"
          className="h-12 w-full rounded-xl text-base font-semibold shadow-md transition-shadow hover:shadow-lg"
          disabled={
            isLoading ||
            !passwordsMatch ||
            !agreedToTerms ||
            !agreedToPrivacy
          }
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}회원가입
        </Button>
      </form>
    </div>
  )
}
