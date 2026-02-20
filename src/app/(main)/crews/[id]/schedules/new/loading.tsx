import { Skeleton } from "@/components/ui/skeleton";

export default function NewScheduleLoading() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex h-14 items-center gap-3 px-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-5 w-20 rounded-lg" />
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-6 px-4 py-5">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-12 rounded" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    </div>
  );
}
