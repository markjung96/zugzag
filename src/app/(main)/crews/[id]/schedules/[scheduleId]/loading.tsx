import { Skeleton } from "@/components/ui/skeleton";

export default function ScheduleDetailLoading() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex h-14 items-center gap-3 px-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-5 w-28 rounded-lg" />
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-6 px-4 py-5">
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <Skeleton className="h-6 w-3/4 rounded-lg" />
          <Skeleton className="h-4 w-1/2 rounded" />
        </div>
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <Skeleton className="h-5 w-24 rounded-lg" />
            <Skeleton className="h-4 w-48 rounded" />
            <Skeleton className="h-4 w-36 rounded" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
