import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  retryLabel?: string
}

export function ErrorState({
  title = '오류가 발생했습니다',
  message = '데이터를 불러오는데 실패했습니다',
  onRetry,
  retryLabel = '다시 시도',
}: ErrorStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
      <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-destructive/10">
        <AlertCircle className="h-12 w-12 text-destructive" aria-hidden="true" />
      </div>
      <div className="text-center">
        <h3 className="mb-2 text-lg font-bold text-destructive">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} className="rounded-xl px-5">
          {retryLabel}
        </Button>
      )}
    </div>
  )
}
