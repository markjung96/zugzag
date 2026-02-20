"use client";

import Link from "next/link";
import { BarChart3, Calendar, ChevronRight } from "lucide-react";
import { RefetchOverlay } from "@/components/ui/refetch-overlay";
import { useAttendanceQuery } from "@/hooks/api/users/use-attendance-query";
import { useSchedulesQuery } from "@/hooks/api/schedules/use-schedules-query";
import type { ScheduleListItem } from "@/types/schedule.types";

export function DashboardContent() {
  const { data: attendance, isFetching: fetchingAttendance } = useAttendanceQuery();
  const { data: schedulesData } = useSchedulesQuery(3);

  const overallRate = attendance?.attendanceRate ?? 0;
  const ratePercent = Math.round(overallRate * 100);

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex h-14 items-center px-4">
          <BarChart3 className="mr-2 h-5 w-5" />
          <h1 className="text-lg font-bold">내 통계</h1>
        </div>
      </header>

      <RefetchOverlay isFetching={fetchingAttendance}>
        <div className="flex flex-1 flex-col gap-6 px-4 py-5">
          <section>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">내 출석률</h2>
            <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-6">
              <div className="relative mb-4 h-32 w-32">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle className="fill-none stroke-muted" strokeWidth="10" cx="50" cy="50" r="40" />
                  <circle
                    className="fill-none stroke-primary transition-all duration-500"
                    strokeWidth="10"
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="40"
                    strokeDasharray={`${ratePercent * 2.51} 251`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{ratePercent}%</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {attendance?.attendedSchedules ?? 0}회 출석 / {attendance?.totalSchedules ?? 0}회 일정
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">크루별 출석률</h2>
            {!attendance?.crewStats || attendance.crewStats.length === 0 ? (
              <Link
                href="/crews"
                className="flex h-24 items-center justify-center rounded-2xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-md"
              >
                <p className="text-sm text-muted-foreground">
                  소속된 크루가 없습니다 · <span className="font-medium text-primary">크루 둘러보기</span>
                </p>
              </Link>
            ) : (
              <div className="space-y-3">
                {attendance.crewStats.map((crew) => (
                  <CrewAttendanceCard key={crew.crewId} crew={crew} />
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground">다가오는 일정</h2>
              <Link href="/schedules" className="flex items-center text-sm text-primary">
                전체 보기
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            {!schedulesData?.schedules || schedulesData.schedules.length === 0 ? (
              <Link
                href="/schedules"
                className="flex h-24 items-center justify-center rounded-2xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-md"
              >
                <p className="text-sm text-muted-foreground">
                  예정된 일정이 없습니다 · <span className="font-medium text-primary">일정 보기</span>
                </p>
              </Link>
            ) : (
              <div className="space-y-3">
                {schedulesData.schedules.map((schedule) => (
                  <ScheduleCard key={schedule.id} schedule={schedule} />
                ))}
              </div>
            )}
          </section>
        </div>
      </RefetchOverlay>
    </div>
  );
}

function CrewAttendanceCard({ crew }: { crew: { crewId: string; crewName: string; attendanceRate: number } }) {
  const ratePercent = Math.round(crew.attendanceRate * 100);

  return (
    <Link href={`/crews/${crew.crewId}`} className="block rounded-2xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium">{crew.crewName}</span>
        <span className="text-sm text-muted-foreground">{ratePercent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${ratePercent}%` }}
        />
      </div>
    </Link>
  );
}

function ScheduleCard({ schedule }: { schedule: ScheduleListItem }) {
  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return `${date.getMonth() + 1}/${date.getDate()} (${days[date.getDay()]})`;
  };

  return (
    <Link
      href={`/crews/${schedule.crewId}/schedules/${schedule.id}`}
      className="block rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98]"
    >
      <div className="mb-1 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="font-medium">{schedule.title}</span>
        </div>
        {schedule.myStatus && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              schedule.myStatus === "attending" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
            }`}
          >
            {schedule.myStatus === "attending" ? "참석 예정" : "대기 중"}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        {schedule.crewName} · {formatDate(schedule.date)} {schedule.startTime}
      </p>
    </Link>
  );
}
