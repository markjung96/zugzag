import { Skeleton } from "@/components/ui/skeleton";

export default function StatsLoading() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex h-14 items-center gap-3 px-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-20 rounded-lg" />
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-6 px-4 py-5">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-32 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-28 rounded-lg" />
          </div>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
