"use client";

import { motion } from "framer-motion";
import { Users, Search, Plus, MapPin, Calendar, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { mockCrews, type MockCrew } from "@/lib/mock";

export default function CrewsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCrews = mockCrews.filter(
    (crew) =>
      crew.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crew.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crew.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crew.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      {/* 헤더 */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">크루</h1>
            <p className="mt-1 text-zinc-400">함께할 클라이밍 크루를 찾아보세요</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-orange-600 hover:to-orange-700 md:px-6 md:py-3"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden md:inline">크루 만들기</span>
          </motion.button>
        </div>
      </motion.div>

      <div className="mx-auto max-w-6xl space-y-6">
        {/* 검색 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="크루 이름, 지역, 태그로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 pr-4 pl-10 text-white placeholder-zinc-500 backdrop-blur-xl transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
            />
          </div>
        </motion.div>

        {/* 크루 목록 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {filteredCrews.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-12 text-center backdrop-blur-xl">
              <Users className="mx-auto mb-4 h-16 w-16 text-zinc-600" />
              <h3 className="mb-2 text-lg font-semibold text-white">크루를 찾을 수 없습니다</h3>
              <p className="text-sm text-zinc-400">
                {searchQuery ? "검색 결과가 없습니다" : "등록된 크루가 없습니다"}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredCrews.map((crew, index) => (
                <CrewCard key={crew.id} crew={crew} index={index} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function CrewCard({ crew, index }: { crew: MockCrew; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
    >
      <Link href={`/crews/${crew.id}`}>
        <div className="group h-full rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl transition-all hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10">
          {/* 헤더 */}
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">{crew.name}</h3>
                {!crew.is_public && (
                  <span className="rounded-lg bg-zinc-800/50 px-2 py-0.5 text-xs font-medium text-zinc-400">
                    비공개
                  </span>
                )}
              </div>
              <p className="line-clamp-2 text-sm text-zinc-400">{crew.description}</p>
            </div>
          </div>

          {/* 정보 */}
          <div className="mb-4 space-y-2">
            {crew.location && (
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <MapPin className="h-4 w-4 text-zinc-400" />
                {crew.location}
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <Users className="h-4 w-4 text-zinc-400" />
              {crew.member_count || 0}명{crew.max_members && ` / ${crew.max_members}명`}
            </div>

            {crew.event_count && (
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <Calendar className="h-4 w-4 text-zinc-400" />
                {crew.event_count}개 일정
              </div>
            )}
          </div>

          {/* 태그 */}
          {crew.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-zinc-800 pt-4">
              {crew.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-zinc-800/50 px-2 py-1 text-xs font-medium text-zinc-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* 호버 인디케이터 */}
          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-orange-500 opacity-0 transition-opacity group-hover:opacity-100">
            자세히 보기 <TrendingUp className="h-4 w-4" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

