"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  User,
  Moon,
  Sun,
  LogOut,
  ChevronRight,
  Users,
  CalendarCheck,
  TrendingUp,
  Info,
  Shield,
  FileText,
  Pencil,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { RefetchOverlay } from "@/components/ui/refetch-overlay";
import { useProfileStatsQuery } from "@/hooks/api/profile/use-profile-stats-query";
import { useUpdateProfileMutation } from "@/hooks/api/profile/use-update-profile-mutation";

export function ProfileContent() {
  const { data: stats, isFetching: fetchingStats } = useProfileStatsQuery();
  const { theme, setTheme } = useTheme();
  const { data: session, update: updateSession } = useSession();

  const updateProfile = useUpdateProfileMutation();

  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editName, setEditName] = useState("");

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  const handleOpenEdit = () => {
    setEditName(session?.user?.name || "");
    setIsEditSheetOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = editName.trim();
    if (trimmedName.length < 1 || trimmedName.length > 50) return;
    updateProfile.mutate(trimmedName, {
      onSuccess: async () => {
        await updateSession({ name: trimmedName });
        setIsEditSheetOpen(false);
      },
    });
  };

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
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{session?.user?.name || "사용자"}</h2>
              <button
                onClick={handleOpenEdit}
                className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
                aria-label="프로필 수정"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
          </div>
        </div>

        <RefetchOverlay isFetching={fetchingStats}>
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
              icon={<TrendingUp className="h-5 w-5" />}
              color="bg-warning/10 text-warning"
            />
          </div>
        </RefetchOverlay>

        <section>
          <div className="mb-3 flex items-center gap-2 px-1">
            <Sun className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-muted-foreground">설정</h3>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/30">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex w-full items-center justify-between p-4 transition-colors hover:bg-accent/50 active:bg-accent"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  {theme === "dark" ? (
                    <Moon className="h-5 w-5 text-primary" />
                  ) : (
                    <Sun className="h-5 w-5 text-primary" />
                  )}
                </div>
                <span className="font-medium">테마</span>
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
                {theme === "dark" ? "다크 모드" : "라이트 모드"}
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
            <MenuItem icon={<Info className="h-5 w-5" />} label="앱 정보" value="v1.0.0" />
            <div className="mx-4 border-t border-border/50" />
            <MenuItem icon={<FileText className="h-5 w-5" />} label="이용약관" href="/terms" showChevron />
            <div className="mx-4 border-t border-border/50" />
            <MenuItem icon={<Shield className="h-5 w-5" />} label="개인정보처리방침" href="/privacy" showChevron />
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

      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl pb-safe">
          <SheetHeader>
            <SheetTitle>프로필 수정</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSaveEdit} className="flex flex-col gap-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name" className="text-sm font-semibold">
                이름
              </Label>
              <Input
                id="profile-name"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="이름을 입력하세요"
                minLength={1}
                maxLength={50}
                className="h-12 rounded-xl"
                disabled={updateProfile.isPending}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">1~50자</p>
            </div>
            <SheetFooter className="flex gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsEditSheetOpen(false)}
                disabled={updateProfile.isPending}
              >
                취소
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={updateProfile.isPending || editName.trim().length < 1 || editName.trim().length > 50}
              >
                {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                저장
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
  icon,
  color,
}: {
  label: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5">
      <div className={`mb-2 flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>{icon}</div>
      <span className="text-2xl font-bold">
        {value}
        {suffix}
      </span>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  value,
  href,
  showChevron,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  href?: string;
  showChevron?: boolean;
}) {
  const className =
    "group flex w-full items-center justify-between p-4 transition-colors hover:bg-accent/50 active:bg-accent";
  return href ? (
    <Link href={href} className={className}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
          {icon}
        </div>
        <span className="font-medium">{label}</span>
      </div>
      {value && (
        <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">{value}</span>
      )}
      {showChevron && (
        <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      )}
    </Link>
  ) : (
    <button type="button" className={className}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
          {icon}
        </div>
        <span className="font-medium">{label}</span>
      </div>
      {value && (
        <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">{value}</span>
      )}
      {showChevron && (
        <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      )}
    </button>
  );
}
