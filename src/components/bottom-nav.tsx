"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Home, Calendar, Plus, BarChart3, User, X, Users, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"

type NavItem = {
  href: string
  icon: typeof Home
  label: string
}

async function fetchCrewCount(): Promise<number> {
  const res = await fetch("/api/crews")
  if (!res.ok) return 0
  const data = await res.json()
  return data.crews?.length ?? 0
}

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [showAddMenu, setShowAddMenu] = useState(false)

  const { data: crewCount = 0 } = useQuery({
    queryKey: ["crew-count"],
    queryFn: fetchCrewCount,
    staleTime: 1000 * 60 * 5,
  })

  const navItems: NavItem[] = [
    { href: "/crews", icon: Home, label: "홈" },
    { href: "/schedules", icon: Calendar, label: "일정" },
    { href: "/dashboard", icon: BarChart3, label: "통계" },
    { href: "/profile", icon: User, label: "마이" },
  ]

  const handleAddClick = () => {
    setShowAddMenu(true)
  }

  const handleMenuClose = () => {
    setShowAddMenu(false)
  }

  const handleNavigate = (path: string) => {
    setShowAddMenu(false)
    router.push(path)
  }

  return (
    <>
      {showAddMenu && (
        <div
          className="fixed inset-0 z-50 bg-black/50 animate-in fade-in duration-200"
          onClick={handleMenuClose}
        >
          <div
            className="absolute bottom-20 left-1/2 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 overflow-hidden rounded-2xl bg-card shadow-lg animate-in slide-in-from-bottom-4 fade-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <span className="font-semibold">추가하기</span>
              <button
                onClick={handleMenuClose}
                className="rounded-full p-1 transition-colors hover:bg-accent"
                aria-label="닫기"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-2">
              <button
                onClick={() => handleNavigate("/crews/new")}
                className="flex w-full items-center gap-3 rounded-xl p-3 transition-colors hover:bg-accent"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium">크루 생성</p>
                  <p className="text-sm text-muted-foreground">
                    새로운 크루를 만들어보세요
                  </p>
                </div>
              </button>
              <button
                onClick={() => handleNavigate("/crews/join")}
                className="flex w-full items-center gap-3 rounded-xl p-3 transition-colors hover:bg-accent"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium">크루 가입</p>
                  <p className="text-sm text-muted-foreground">
                    초대 코드로 크루에 가입하세요
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background pb-safe">
        <div className="mx-auto flex h-16 max-w-lg items-center justify-around">
          {navItems.slice(0, 2).map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/")
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-full min-w-[56px] flex-col items-center justify-center gap-1 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground active:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}

          <button
            onClick={handleAddClick}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95"
            aria-label="추가하기"
            aria-haspopup="dialog"
            aria-expanded={showAddMenu}
          >
            <Plus className="h-6 w-6" />
          </button>

          {navItems.slice(2).map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/")
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-full min-w-[56px] flex-col items-center justify-center gap-1 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground active:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
