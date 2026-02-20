import { Skeleton } from "@/components/ui/skeleton";

export default function MembersLoading() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex h-14 items-center gap-3 px-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-5 w-24 rounded-lg" />
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 px-4 py-5">
        <div className="flex gap-2">
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
