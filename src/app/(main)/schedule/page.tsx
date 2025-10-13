"use client";

import { motion } from "framer-motion";
import { Calendar, List, Plus, Filter, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";

import { mockEvents, type MockEvent } from "@/lib/mock";

import { EventCalendar } from "./_components/event-calendar";
import { EventList } from "./_components/event-list";
import { FilterBar } from "./_components/filter-bar";

type ViewMode = "list" | "calendar";

export type FilterOptions = {
  crewId?: string;
  status?: "all" | "upcoming" | "past";
  searchQuery?: string;
};

export default function SchedulePage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    status: "upcoming",
  });

  // 데이터 상태 관리
  const [events, setEvents] = useState<MockEvent[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Supabase 데이터 페칭 (API Route 사용)
  const fetchEvents = async () => {
    // 첫 로딩인지 재로딩인지 구분
    if (events === null) {
      setIsLoading(true);
    } else {
      setIsFetching(true);
    }
    setError(null);

    try {
      // API Route를 통해 데이터 호출
      const params = new URLSearchParams();
      if (filters.crewId) params.append("crew_id", filters.crewId);
      if (filters.status && filters.status !== "all") params.append("status", filters.status);

      const response = await fetch(`/api/events?${params.toString()}`);

      if (!response.ok) {
        throw new Error("일정을 불러올 수 없습니다");
      }

      const result = await response.json();

      // Supabase 데이터를 MockEvent 형식으로 변환
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformedEvents: MockEvent[] = (result.events || []).map((event: any) => ({
        ...event,
        creator: event.creator || {
          id: event.created_by || "",
          full_name: "Unknown",
          avatar_url: null,
          nickname: null,
        },
        crew: event.crew || {
          id: event.crew_id,
          name: "Unknown Crew",
          logo_url: null,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        phases: (event.phases || []).map((phase: any) => ({
          ...phase,
          gym: phase.gym || null,
        })),
        stats: event.stats || undefined,
      }));

      setEvents(transformedEvents);
    } catch (err) {
      console.error("데이터 로드 실패:", err);

      // 개발 환경에서만 Mock 데이터로 fallback
      if (process.env.NODE_ENV === "development") {
        try {
          let filtered = [...mockEvents];
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          // 상태 필터
          if (filters.status === "upcoming") {
            filtered = filtered.filter((e) => new Date(e.event_date) >= today);
          } else if (filters.status === "past") {
            filtered = filtered.filter((e) => new Date(e.event_date) < today);
          }

          // 크루 필터
          if (filters.crewId) {
            filtered = filtered.filter((e) => e.crew_id === filters.crewId);
          }

          // 정렬
          filtered.sort((a, b) => {
            const dateA = new Date(a.event_date).getTime();
            const dateB = new Date(b.event_date).getTime();
            return filters.status === "past" ? dateB - dateA : dateA - dateB;
          });

          setEvents(filtered);
          console.warn("⚠️ Mock 데이터를 사용 중입니다. Supabase 연결을 확인하세요.");
        } catch {
          setError(err instanceof Error ? err : new Error("일정을 불러오는데 실패했습니다"));
          setEvents([]);
        }
      } else {
        setError(err instanceof Error ? err : new Error("일정을 불러오는데 실패했습니다"));
        setEvents([]);
      }
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  // 필터 변경 시 데이터 다시 로드
  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.crewId, filters.status]);

  // 클라이언트 사이드 필터링 (검색)
  const filteredEvents = useMemo(() => {
    if (!events) return null;
    if (!filters.searchQuery) return events;

    const query = filters.searchQuery.toLowerCase();
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(query) ||
        e.description?.toLowerCase().includes(query) ||
        e.crew.name.toLowerCase().includes(query) ||
        e.tags.some((tag) => tag.toLowerCase().includes(query)),
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

          <motion.button
            onClick={() => router.push("/events/create")}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-orange-600 hover:to-orange-700 md:px-6 md:py-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="h-5 w-5" />
            <span className="hidden md:inline">일정 만들기</span>
          </motion.button>
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
          <EventList
            data={filteredEvents}
            isLoading={isLoading}
            isFetching={isFetching}
            error={error}
            isEmpty={isEmpty && !filters.searchQuery}
            searchQuery={filters.searchQuery}
            onRefetch={fetchEvents}
          />
        ) : (
          <EventCalendar
            data={filteredEvents}
            isLoading={isLoading}
            isFetching={isFetching}
            error={error}
            onRefetch={fetchEvents}
          />
        )}
      </motion.div>
    </div>
  );
}
