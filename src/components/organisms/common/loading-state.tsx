import { Skeleton } from '@/components/ui/skeleton'

interface LoadingStateProps {
  count?: number
}

export function LoadingState({ count = 3 }: LoadingStateProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg">
          <Skeleton className="h-5 w-1/3 mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  )
}
