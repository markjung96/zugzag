import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex h-14 items-center px-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="ml-2 flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-20 rounded-lg" />
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-6 px-4 py-5">
        <div className="space-y-3">
          <Skeleton className="h-4 w-24 rounded-lg" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-20 rounded-lg" />
          <div className="rounded-2xl border border-border p-5 space-y-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-16 rounded-lg" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
