"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";

import { useUserCrewsQuery } from "@/app/(main)/crews/_hooks/use-user-crews-query";

import type { FilterOptions } from "../page";

type FilterBarProps = {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
};

export function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
  // React Query로 사용자 크루 목록 조회
  const { data: userCrewsData } = useUserCrewsQuery();
  const crews = userCrewsData?.crews.map((membership) => membership.crew) || [];

  const statusOptions = [
    { value: "all", label: "전체" },
    { value: "upcoming", label: "다가오는 일정" },
    { value: "past", label: "지난 일정" },
  ] as const;

  const handleReset = () => {
    onFiltersChange({ status: "upcoming" });
  };

  const hasActiveFilters = filters.crewId || filters.status !== "upcoming";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-xl"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-4">
          {/* 상태 필터 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">상태</label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    onFiltersChange({ ...filters, status: option.value as FilterOptions["status"] })
                  }
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    filters.status === option.value
                      ? "bg-orange-500 text-white"
                      : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 크루 필터 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">크루</label>
            <select
              value={filters.crewId || ""}
              onChange={(e) => onFiltersChange({ ...filters, crewId: e.target.value || undefined })}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-white transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none md:w-auto"
            >
              <option value="">전체 크루</option>
              {crews.map((crew) => (
                <option key={crew.id} value={crew.id}>
                  {crew.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 초기화 버튼 */}
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="ml-4 flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-400 transition-all hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-4 w-4" />
            초기화
          </button>
        )}
      </div>

      {/* 활성 필터 요약 */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-800 pt-4">
          {filters.crewId && (
            <span className="flex items-center gap-1 rounded-lg bg-orange-500/10 px-2 py-1 text-xs font-medium text-orange-500">
              크루: {crews.find((c) => c.id === filters.crewId)?.name}
              <button
                onClick={() => onFiltersChange({ ...filters, crewId: undefined })}
                className="ml-1 hover:text-orange-400"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.status && filters.status !== "upcoming" && (
            <span className="flex items-center gap-1 rounded-lg bg-cyan-400/10 px-2 py-1 text-xs font-medium text-cyan-400">
              {statusOptions.find((s) => s.value === filters.status)?.label}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
