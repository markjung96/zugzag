"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BarChart3, Users, Calendar, TrendingUp, Crown, Shield, User } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

type Role = "leader" | "admin" | "member";

type MemberStat = {
  memberId: string;
  userId: string;
  name: string;
  image: string | null;
  role: Role;
  attended: number;
  total: number;
  rate: number;
};

type StatsData = {
  totalSchedules: number;
  totalAttendance: number;
  averageAttendanceRate: number;
  memberStats: MemberStat[];
};

type Crew = {
  id: string;
  name: string;
  myRole: Role;
  canManage: boolean;
};

const PERIOD_OPTIONS = [
  { value: 7, label: "최근 7일" },
  { value: 30, label: "최근 30일" },
  { value: 90, label: "최근 90일" },
  { value: 365, label: "최근 1년" },
];

const ROLE_CONFIG: Record<Role, { label: string; icon: typeof Crown; color: string }> = {
  leader: { label: "크루장", icon: Crown, color: "text-warning" },
  admin: { label: "운영진", icon: Shield, color: "text-primary" },
  member: { label: "멤버", icon: User, color: "text-muted-foreground" },
};

async function fetchCrew(crewId: string): Promise<Crew> {
  const res = await fetch(`/api/crews/${crewId}`);
  if (!res.ok) throw new Error("Failed to fetch crew");
  return res.json();
}

async function fetchStats(crewId: string, days: number): Promise<StatsData> {
  const res = await fetch(`/api/crews/${crewId}/stats?days=${days}`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export default function CrewStatsPage() {
  const params = useParams();
  const router = useRouter();
  const crewId = params.id as string;

  const [period, setPeriod] = useState(30);

  const { data: crew, isLoading: crewLoading } = useQuery({
    queryKey: ["crew", crewId],
    queryFn: () => fetchCrew(crewId),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["crew-stats", crewId, period],
    queryFn: () => fetchStats(crewId, period),
  });

  if (crewLoading) {
    return <LoadingState />;
  }

  if (!crew || !crew.canManage) {
    router.push(`/crews/${crewId}`);
    return null;
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/crews/${crewId}`}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="뒤로 가기"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-bold">크루 통계</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 px-4 py-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">{crew.name}</h2>
          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            className="rounded-xl border-2 border-border bg-card px-3 py-2 text-sm font-medium transition-colors focus:border-primary focus:outline-none"
          >
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {statsLoading ? (
          <StatsLoadingState />
        ) : stats ? (
          <>
            <div className="grid grid-cols-3 gap-3">
              <StatCard
                icon={Calendar}
                label="총 일정"
                value={stats.totalSchedules}
                unit="회"
                color="bg-primary/10 text-primary"
              />
              <StatCard
                icon={Users}
                label="총 출석"
                value={stats.totalAttendance}
                unit="회"
                color="bg-success/10 text-success"
              />
              <StatCard
                icon={TrendingUp}
                label="평균 출석률"
                value={Math.round(stats.averageAttendanceRate * 100)}
                unit="%"
                color="bg-warning/10 text-warning"
              />
            </div>

            <section>
              <div className="mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold">멤버별 출석률</h3>
              </div>
              {stats.memberStats.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {stats.memberStats.map((member, index) => (
                    <MemberStatCard key={member.memberId} member={member} rank={index + 1} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20 py-16">
                  <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
                    <BarChart3 className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">아직 출석 데이터가 없어요</h3>
                  <p className="text-center text-sm leading-relaxed text-muted-foreground">
                    일정을 진행하면
                    <br />
                    출석 통계가 표시됩니다
                  </p>
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  color,
}: {
  icon: typeof Calendar;
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5">
      <div className={`mb-2 flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-xl font-bold">
        {value}
        <span className="text-sm font-normal text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}

function MemberStatCard({ member, rank }: { member: MemberStat; rank: number }) {
  const roleConfig = ROLE_CONFIG[member.role];
  const RoleIcon = roleConfig.icon;
  const percentage = Math.round(member.rate * 100);

  const getRankBadge = () => {
    if (rank === 1) return "bg-gradient-to-br from-warning to-warning/70 text-warning-foreground shadow-sm shadow-warning/30";
    if (rank === 2) return "bg-gradient-to-br from-muted-foreground/50 to-muted-foreground/80 text-white shadow-sm shadow-muted-foreground/30";
    if (rank === 3) return "bg-gradient-to-br from-warning/70 to-warning/50 text-warning-foreground shadow-sm shadow-warning/30";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${getRankBadge()}`}
          >
            {rank}
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted/50 text-sm font-bold text-muted-foreground">
            {member.image ? (
              <Image src={member.image} alt={member.name} width={44} height={44} className="h-full w-full rounded-full object-cover" />
            ) : (
              member.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold">{member.name}</span>
              <RoleIcon className={`h-3.5 w-3.5 ${roleConfig.color}`} />
            </div>
            <p className="text-xs text-muted-foreground">
              {member.attended}/{member.total}회 출석
            </p>
          </div>
        </div>
        <span className={`text-xl font-bold ${percentage >= 80 ? "text-success" : percentage >= 50 ? "text-warning" : "text-destructive"}`}>
          {percentage}%
        </span>
      </div>
      <Progress value={percentage} className="h-1.5" />
    </div>
  );
}

function LoadingState() {
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
        <StatsLoadingState />
      </div>
    </div>
  );
}

function StatsLoadingState() {
  return (
    <>
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
    </>
  );
}
