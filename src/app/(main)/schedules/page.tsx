"use client";

import { motion } from "framer-motion";
import { Calendar, List, Plus, Filter, Search, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

import type { ScheduleWithRelations } from "@/lib/api/schedule-helpers";

import { FilterBar } from "./_components/filter-bar";
import { ScheduleCalendar } from "./_components/schedule-calendar";
import { ScheduleList } from "./_components/schedule-list";
import { useSchedulesQuery } from "./_hooks";

type ViewMode = "list" | "calendar";

export type FilterOptions = {
  crewId?: string;
  status?: "all" | "upcoming" | "past";
  searchQuery?: string;
};

/**
 * UI에서 사용할 일정 타입 (통계 포함)
 */
export type Schedule = ScheduleWithRelations & {
  stats?: {
    attending_count: number;
    waitlist_count: number;
    checked_in_count: number;
  };
};

export default function SchedulePage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    status: "upcoming",
  });

  // React Query로 스케줄 목록 조회
  const { data, isLoading, isFetching, error, refetch } = useSchedulesQuery({
    crew_id: filters.crewId,
    status: filters.status === "all" ? undefined : filters.status,
  });

  // Supabase 데이터를 Schedule 형식으로 변환
  const events: Schedule[] | null = useMemo(() => {
    if (!data?.schedules) return null;

    return data.schedules.map((event) => ({
      ...event,
      crew: event.crew || null,
      phases: event.phases || [],
      stats: undefined,
    })) as Schedule[];
  }, [data]);

  // 클라이언트 사이드 필터링 (검색)
  const filteredEvents = useMemo(() => {
    if (!events) return null;
    if (!filters.searchQuery) return events;

    const query = filters.searchQuery.toLowerCase();
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(query) ||
        e.description?.toLowerCase().includes(query) ||
        e.crew?.name.toLowerCase().includes(query) ||
        (e.tags && e.tags.some((tag) => tag.toLowerCase().includes(query))),
    );
  }, [events, filters.searchQuery]);

  const isEmpty = !isLoading && !error && events !== null && events.length === 0;

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      {/* 헤더 */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">일정</h1>
            <p className="mt-1 text-zinc-400">크루 일정을 확인하고 참석하세요</p>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center justify-center rounded-xl bg-zinc-900/50 p-4 text-white transition-all hover:bg-zinc-800 disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            </motion.button>

            <motion.button
              onClick={() => router.push("/schedules/create")}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-orange-600 hover:to-orange-700 md:px-6 md:py-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="h-5 w-5" />
              <span className="hidden md:inline">일정 만들기</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* 검색 & 뷰 전환 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* 검색 바 */}
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="일정 검색..."
              value={filters.searchQuery || ""}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2 pr-4 pl-10 text-white placeholder-zinc-500 backdrop-blur-xl transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
            />
          </div>

          {/* 컨트롤 버튼들 */}
          <div className="flex items-center gap-2">
            {/* 필터 버튼 */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                showFilters
                  ? "border-orange-500 bg-orange-500/10 text-orange-500"
                  : "border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/50"
              }`}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden md:inline">필터</span>
            </button>

            {/* 뷰 전환 버튼 */}
            <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900/50 p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  viewMode === "list"
                    ? "bg-orange-500 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  viewMode === "calendar"
                    ? "bg-orange-500 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Calendar className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 필터 바 */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <FilterBar filters={filters} onFiltersChange={setFilters} />
          </motion.div>
        )}
      </motion.div>

      {/* 컨텐츠 영역 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {viewMode === "list" ? (
          <ScheduleList
            data={filteredEvents}
            isLoading={isLoading}
            isFetching={isFetching}
            error={error || null}
            isEmpty={isEmpty && !filters.searchQuery}
            searchQuery={filters.searchQuery}
            onRefetch={refetch}
          />
        ) : (
          <ScheduleCalendar
            data={filteredEvents}
            isLoading={isLoading}
            isFetching={isFetching}
            error={error || null}
            onRefetch={refetch}
          />
        )}
      </motion.div>
    </div>
  );
}
