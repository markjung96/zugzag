import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/utils/get-error-message'

interface SignupData {
  name: string
  email: string
  password: string
}

interface SignupResponse {
  user: { id: string; email: string; name: string }
}

export function useSignupMutation() {
  return useMutation({
    mutationFn: async (data: SignupData): Promise<SignupResponse> => {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        const err = new Error(
          (errData as { error?: string })?.error || '회원가입에 실패했습니다'
        ) as Error & { code?: string }
        err.code = (errData as { code?: string })?.code
        throw err
      }
      return res.json()
    },
    onError: (error) => {
      toast.error(getErrorMessage(error), { duration: 4000 })
    },
  })
}