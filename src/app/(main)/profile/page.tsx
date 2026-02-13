'use client'

import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import {
  User,
  Moon,
  Sun,
  LogOut,
  ChevronRight,
  Users,
  CalendarCheck,
  Info,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProfileStatsQuery } from '@/hooks/api/profile/use-profile-stats-query'

export default function ProfilePage() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()

  const { data: stats } = useProfileStatsQuery()

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' })
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex h-14 items-center px-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold">마이페이지</h1>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 px-4 py-5">
        <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card to-card/80">
          <div className="flex flex-col items-center px-5 py-6">
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-4 ring-background">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt="프로필"
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-primary" />
              )}
            </div>
            <h2 className="text-xl font-bold">{session?.user?.name || '사용자'}</h2>
            <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="소속 크루"
            value={stats?.totalCrews ?? 0}
            icon={<Users className="h-5 w-5" />}
            color="bg-primary/10 text-primary"
          />
          <StatCard
            label="총 출석"
            value={stats?.totalSchedules ?? 0}
            icon={<CalendarCheck className="h-5 w-5" />}
            color="bg-success/10 text-success"
          />
          <StatCard
            label="출석률"
            value={Math.round((stats?.attendanceRate ?? 0) * 100)}
            suffix="%"
            icon={<CalendarCheck className="h-5 w-5" />}
            color="bg-warning/10 text-warning"
          />
        </div>

        <section>
          <div className="mb-3 flex items-center gap-2 px-1">
            <Sun className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-muted-foreground">설정</h3>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/30">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex w-full items-center justify-between p-4 transition-colors hover:bg-accent/50 active:bg-accent"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  {theme === 'dark' ? (
                    <Moon className="h-5 w-5 text-primary" />
                  ) : (
                    <Sun className="h-5 w-5 text-primary" />
                  )}
                </div>
                <span className="font-medium">테마</span>
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
                {theme === 'dark' ? '다크 모드' : '라이트 모드'}
              </span>
            </button>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2 px-1">
            <Info className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-muted-foreground">정보</h3>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/30">
            <MenuItem
              icon={<Info className="h-5 w-5" />}
              label="앱 정보"
              value="v1.0.0"
            />
            <div className="mx-4 border-t border-border/50" />
            <MenuItem
              icon={<Shield className="h-5 w-5" />}
              label="개인정보처리방침"
              showChevron
            />
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2 px-1">
            <LogOut className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-muted-foreground">계정</h3>
          </div>

          <Button
            variant="outline"
            className="h-14 w-full justify-start gap-4 rounded-2xl border-2 border-destructive/30 bg-card px-4 text-base font-semibold text-destructive transition-all hover:border-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
              <LogOut className="h-5 w-5" />
            </div>
            로그아웃
          </Button>
        </section>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  suffix,
  icon,
  color,
}: {
  label: string
  value: number
  suffix?: string
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5">
      <div className={`mb-2 flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
        {icon}
      </div>
      <span className="text-2xl font-bold">{value}{suffix}</span>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  )
}

function MenuItem({
  icon,
  label,
  value,
  showChevron,
}: {
  icon: React.ReactNode
  label: string
  value?: string
  showChevron?: boolean
}) {
  return (
    <button className="group flex w-full items-center justify-between p-4 transition-colors hover:bg-accent/50 active:bg-accent">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
          {icon}
        </div>
        <span className="font-medium">{label}</span>
      </div>
      {value && (
        <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
          {value}
        </span>
      )}
      {showChevron && (
        <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      )}
    </button>
  )
}
