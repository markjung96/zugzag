import { Skeleton } from '@/components/ui/skeleton'

export default function SchedulesLoading() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex h-14 items-center gap-2 px-4">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-16 rounded-lg" />
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 px-4 py-5">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
