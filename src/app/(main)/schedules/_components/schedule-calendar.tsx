"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";

import type { ScheduleWithRelations } from "@/lib/api/schedule-helpers";

type Schedule = ScheduleWithRelations & {
  stats?: {
    attending_count: number;
    waitlist_count: number;
    checked_in_count: number;
  };
};

type ScheduleCalendarProps = {
  data: Schedule[] | null;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  onRefetch: () => void; // Server Action이 아닌 일반 콜백
};

type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
  schedules: Schedule[];
};

export function ScheduleCalendar({
  data,
  isLoading,
  isFetching,
  error,
  onRefetch,
}: ScheduleCalendarProps) {
  // 첫 로딩 (스켈레톤)
  if (isLoading) {
    return <ScheduleCalendarSkeleton />;
  }

  // 에러 상태
  if (error) {
    return <ScheduleCalendarError error={error} onRetry={onRefetch} />;
  }

  // 정상 렌더링
  return <ScheduleCalendarNormal data={data || []} isFetching={isFetching} />;
}

// 정상 캘린더
function ScheduleCalendarNormal({ data, isFetching }: { data: Schedule[]; isFetching: boolean }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const currentDateIter = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dateStr = currentDateIter.toISOString().split("T")[0];
      const daySchedules = data.filter((e) => e.event_date === dateStr);

      days.push({
        date: new Date(currentDateIter),
        isCurrentMonth: currentDateIter.getMonth() === month,
        schedules: daySchedules,
      });

      currentDateIter.setDate(currentDateIter.getDate() + 1);
    }

    return days;
  }, [currentDate, data]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="relative space-y-6">
      {/* 재로딩 인디케이터 */}
      {isFetching && (
        <div className="absolute top-4 right-4 z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 shadow-lg"
          >
            <RefreshCw className="h-4 w-4 animate-spin" />
            새로고침 중...
          </motion.div>
        </div>
      )}

      {/* 캘린더 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-xl"
      >
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
          </h2>
          <button
            onClick={goToToday}
            className="rounded-lg bg-zinc-800/50 px-3 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            오늘
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="rounded-lg bg-zinc-800/50 p-2 text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goToNextMonth}
            className="rounded-lg bg-zinc-800/50 p-2 text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </motion.div>

      {/* 캘린더 그리드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl"
      >
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-900/80">
          {weekDays.map((day, index) => (
            <div
              key={day}
              className={`p-3 text-center text-sm font-semibold ${
                index === 0 ? "text-red-400" : index === 6 ? "text-blue-400" : "text-zinc-400"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`min-h-[100px] border-r border-b border-zinc-800 p-2 transition-colors hover:bg-zinc-800/30 lg:min-h-[120px] ${
                !day.isCurrentMonth ? "bg-zinc-900/30" : ""
              } ${day.date.getDay() === 6 ? "border-r-0" : ""}`}
            >
              {/* 날짜 숫자 */}
              <div
                className={`mb-1 flex items-center justify-center ${
                  isToday(day.date)
                    ? "h-6 w-6 rounded-full bg-orange-500 text-xs font-bold text-white"
                    : day.isCurrentMonth
                      ? "text-sm font-medium text-white"
                      : "text-sm text-zinc-600"
                }`}
              >
                {day.date.getDate()}
              </div>

              {/* 일정 목록 */}
              <div className="space-y-1">
                {day.schedules.slice(0, 2).map((schedule) => (
                  <Link key={schedule.id} href={`/schedules/${schedule.id}`}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="cursor-pointer truncate rounded bg-gradient-to-r from-orange-500/20 to-cyan-400/20 px-2 py-1 text-xs font-medium text-white transition-colors hover:from-orange-500/30 hover:to-cyan-400/30"
                      title={schedule.title}
                    >
                      {schedule.title}
                    </motion.div>
                  </Link>
                ))}
                {day.schedules.length > 2 && (
                  <div className="px-2 text-xs text-zinc-500">+{day.schedules.length - 2}개 더</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 이번 달 일정 요약 */}
      {data.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
        >
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-white">
              {currentDate.getMonth() + 1}월 일정 ({data.length}개)
            </h3>
          </div>
          <div className="space-y-2">
            {data.slice(0, 5).map((schedule) => (
              <Link key={schedule.id} href={`/schedules/${schedule.id}`}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 transition-colors hover:border-orange-500/50"
                >
                  <div className="flex-1">
                    <div className="font-medium text-white">{schedule.title}</div>
                    <div className="mt-1 text-xs text-zinc-400">
                      {new Date(schedule.event_date).toLocaleDateString("ko-KR", {
                        month: "long",
                        day: "numeric",
                        weekday: "short",
                      })}{" "}
                      · {schedule.crew?.name || "Unknown Crew"}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-zinc-400" />
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// 스켈레톤 (첫 로딩)
function ScheduleCalendarSkeleton() {
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="space-y-6">
      {/* 헤더 스켈레톤 */}
      <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
        <div className="h-8 w-32 animate-pulse rounded bg-zinc-800" />
        <div className="flex gap-2">
          <div className="h-10 w-10 animate-pulse rounded-lg bg-zinc-800" />
          <div className="h-10 w-10 animate-pulse rounded-lg bg-zinc-800" />
        </div>
      </div>

      {/* 캘린더 스켈레톤 */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
        <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-900/80">
          {weekDays.map((day) => (
            <div key={day} className="p-3 text-center text-sm font-semibold text-zinc-400">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: 42 }).map((_, i) => (
            <div
              key={i}
              className="min-h-[100px] animate-pulse border-r border-b border-zinc-800 p-2 lg:min-h-[120px]"
            >
              <div className="mb-2 h-4 w-6 rounded bg-zinc-800" />
              <div className="space-y-1">
                <div className="h-6 w-full rounded bg-zinc-800/50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 에러 상태
function ScheduleCalendarError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[400px] items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50"
    >
      <div className="max-w-md text-center">
        <div className="mb-4 inline-flex rounded-full bg-red-500/10 p-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-white">캘린더를 불러올 수 없습니다</h3>
        <p className="mb-6 text-sm text-zinc-400">{error.message}</p>
        <button
          onClick={onRetry}
          className="rounded-xl bg-orange-500 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-600"
        >
          다시 시도
        </button>
      </div>
    </motion.div>
  );
}
