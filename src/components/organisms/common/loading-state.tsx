interface LoadingStateProps {
  message?: string
  fullHeight?: boolean
}

export function LoadingState({
  message = '불러오는 중...',
  fullHeight = false
}: LoadingStateProps) {
  return (
    <div className={`flex flex-1 items-center justify-center ${fullHeight ? 'min-h-[calc(100vh-5rem)]' : 'py-16'}`}>
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
        <p className="text-sm font-medium text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
