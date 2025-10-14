"use client";

import { motion } from "framer-motion";
import { Calendar, Inbox, AlertCircle, RefreshCw } from "lucide-react";

import type { ScheduleWithRelations } from "@/lib/api/schedule-helpers";

import { ScheduleCard } from "./schedule-card";

type Schedule = ScheduleWithRelations & {
  stats?: {
    attending_count: number;
    waitlist_count: number;
    checked_in_count: number;
  };
};

type ScheduleListProps = {
  data: Schedule[] | null;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  isEmpty: boolean;
  searchQuery?: string;
  onRefetch: () => void;
};

export function ScheduleList({
  data,
  isLoading,
  isFetching,
  error,
  isEmpty,
  searchQuery,
  onRefetch,
}: ScheduleListProps) {
  // 첫 로딩 (스켈레톤)
  if (isLoading) {
    return <ScheduleListSkeleton />;
  }

  // 에러 상태
  if (error) {
    return <ScheduleListError error={error} onRetry={onRefetch} />;
  }

  // 빈 데이터
  if (isEmpty) {
    return <ScheduleListEmpty searchQuery={searchQuery} />;
  }

  // 정상 데이터
  return (
    <div className="relative">
      {/* 재로딩 인디케이터 */}
      {isFetching && <ScheduleListLoading />}

      {/* 결과 카운트 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-4 flex items-center justify-between"
      >
        <p className="text-sm text-zinc-400">
          총 <span className="font-semibold text-white">{data?.length || 0}</span>개의 일정
        </p>
      </motion.div>

      {/* 일정 카드 그리드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.map((schedule, index) => (
          <ScheduleCard key={schedule.id} schedule={schedule} index={index} />
        ))}
      </div>
    </div>
  );
}

// 스켈레톤 (첫 로딩)
function ScheduleListSkeleton() {
  return (
    <div>
      <div className="mb-4 h-5 w-32 animate-pulse rounded bg-zinc-800" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-[280px] animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/50"
          >
            <div className="p-6">
              <div className="mb-4 h-4 w-24 rounded bg-zinc-800" />
              <div className="mb-2 h-6 w-3/4 rounded bg-zinc-800" />
              <div className="mb-4 h-4 w-full rounded bg-zinc-800" />
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-zinc-800" />
                <div className="h-4 w-full rounded bg-zinc-800" />
                <div className="h-4 w-2/3 rounded bg-zinc-800" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 로딩 (재로딩)
function ScheduleListLoading() {
  return (
    <div className="absolute top-0 right-0 z-10">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 shadow-lg"
      >
        <RefreshCw className="h-4 w-4 animate-spin" />
        새로고침 중...
      </motion.div>
    </div>
  );
}

// 에러 상태
function ScheduleListError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[400px] items-center justify-center"
    >
      <div className="max-w-md text-center">
        <div className="mb-4 inline-flex rounded-full bg-red-500/10 p-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-white">일정을 불러올 수 없습니다</h3>
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

// 빈 데이터
function ScheduleListEmpty({ searchQuery }: { searchQuery?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[400px] items-center justify-center"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-zinc-900/50 p-6">
          {searchQuery ? (
            <Inbox className="h-12 w-12 text-zinc-600" />
          ) : (
            <Calendar className="h-12 w-12 text-zinc-600" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">일정이 없습니다</h3>
          <p className="mt-1 text-sm text-zinc-400">
            {searchQuery ? "검색 결과가 없습니다" : "등록된 일정이 없습니다"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
