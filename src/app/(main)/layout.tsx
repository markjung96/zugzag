"use client"

import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { status } = useSession()

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="mx-auto w-full max-w-lg">
        {children}
      </div>
      <BottomNav />
    </div>
  )
}
