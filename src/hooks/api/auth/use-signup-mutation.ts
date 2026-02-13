import { useMutation } from '@tanstack/react-query'

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
        const error = await res.json()
        throw new Error(error.error || '회원가입에 실패했습니다')
      }
      return res.json()
    },
  })
}