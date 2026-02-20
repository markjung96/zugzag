"use client"

import { useSession } from "next-auth/react"
import { BottomNav } from "@/components/bottom-nav"
import { Skeleton } from "@/components/ui/skeleton"

export function MainLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const { status } = useSession()

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex-1 p-4 space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        본문으로 건너뛰기
      </a>
      <main id="main-content" className="mx-auto w-full max-w-lg">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
