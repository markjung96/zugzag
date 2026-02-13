import { Skeleton } from '@/components/ui/skeleton'

export default function CrewsLoading() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-16 rounded-lg" />
          </div>
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 px-4 py-5">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
