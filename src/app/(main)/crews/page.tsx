"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, MapPin, TrendingUp, KeyRound, Loader2, X, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/components/toast-provider";
import { useDebounce } from "@/hooks/useDebounce";
import type { CrewWithCreatorAndCount } from "@/lib/api/crew-helpers";

import { useCrewsQuery, useInviteByCodeQuery, useJoinByInviteMutation } from "./_hooks";

type Crew = CrewWithCreatorAndCount;

export default function CrewsPage() {
  const router = useRouter();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  // 검색어 디바운스
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const debouncedInviteCode = useDebounce(inviteCode, 500);

  // React Query로 크루 목록 조회
  const { data, isLoading, error, refetch } = useCrewsQuery({
    search: debouncedSearchQuery?.trim() || undefined,
  });

  // 초대 코드로 크루 조회
  const {
    data: inviteData,
    isLoading: inviteLoading,
    error: inviteError,
  } = useInviteByCodeQuery(
    debouncedInviteCode.length === 8 ? debouncedInviteCode.toUpperCase() : null,
  );

  // 초대로 가입
  const joinByInviteMutation = useJoinByInviteMutation();

  const crews: Crew[] = data?.crews || [];
  const filteredCrews = crews;

  const handleJoinByCode = async () => {
    if (inviteCode.length !== 8) {
      toast.error("8자리 코드를 입력해주세요");
      return;
    }

    try {
      const result = await joinByInviteMutation.mutateAsync(inviteCode.toUpperCase());
      toast.success(`${result.crew.name} 크루에 가입되었습니다!`);
      setShowInviteModal(false);
      setInviteCode("");
      router.push(`/crews/${result.crew.id}`);
    } catch (err) {
      console.error("Error joining by invite:", err);

      // 온보딩이 필요한 경우
      if (err instanceof Error && err.message.includes("ONBOARDING_REQUIRED")) {
        toast.error("먼저 프로필을 완성해주세요");
        setShowInviteModal(false);
        router.push("/onboarding");
        return;
      }

      toast.error(err instanceof Error ? err.message : "크루 가입에 실패했습니다");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-orange-500" />
          <p className="text-sm text-zinc-400">불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center">
          <Users className="mx-auto mb-4 h-16 w-16 text-zinc-600" />
          <h2 className="mb-2 text-xl font-bold text-white">오류가 발생했습니다</h2>
          <p className="mb-6 text-zinc-400">
            {error instanceof Error ? error.message : "크루 목록을 불러오는데 실패했습니다"}
          </p>
          <button
            onClick={() => refetch()}
            className="rounded-xl bg-orange-500 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

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
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-indigo-600 hover:to-indigo-700 md:px-6 md:py-3"
          >
            <KeyRound className="h-5 w-5" />
            <span className="hidden md:inline">코드로 가입</span>
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
              placeholder="크루 이름, 지역으로 검색..."
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

      {/* 초대 코드 입력 모달 */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6"
            >
              {/* 헤더 */}
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h3 className="flex items-center text-xl font-bold text-white">
                    <KeyRound className="mr-2 h-6 w-6 text-indigo-400" />
                    초대 코드로 가입
                  </h3>
                  <p className="mt-1 text-sm text-zinc-400">8자리 초대 코드를 입력하세요</p>
                </div>
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteCode("");
                  }}
                  className="rounded-lg p-1 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* 코드 입력 */}
              <div className="mb-6">
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                    if (value.length <= 8) {
                      setInviteCode(value);
                    }
                  }}
                  placeholder="ABC12345"
                  maxLength={8}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-center font-mono text-2xl font-bold tracking-widest text-white placeholder-zinc-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                  autoFocus
                />
                <p className="mt-2 text-center text-xs text-zinc-500">{inviteCode.length}/8</p>
              </div>

              {/* 크루 정보 미리보기 */}
              {inviteLoading && inviteCode.length === 8 && (
                <div className="mb-6 flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-800/50 p-4">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin text-indigo-400" />
                  <span className="text-sm text-zinc-400">크루 정보 확인 중...</span>
                </div>
              )}

              {inviteError && inviteCode.length === 8 && (
                <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                  <p className="text-sm text-red-400">
                    {inviteError instanceof Error
                      ? inviteError.message
                      : "초대 코드를 찾을 수 없습니다"}
                  </p>
                </div>
              )}

              {inviteData?.invite && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-4"
                >
                  <div className="mb-2 flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-400" />
                    <span className="font-medium text-white">크루를 찾았습니다!</span>
                  </div>
                  <div className="mt-3 space-y-1">
                    <p className="text-lg font-bold text-white">{inviteData.invite.crew?.name}</p>
                    {inviteData.invite.crew?.description && (
                      <p className="text-sm text-zinc-400">{inviteData.invite.crew.description}</p>
                    )}
                    {inviteData.invite.crew?.location && (
                      <p className="flex items-center text-sm text-zinc-400">
                        <MapPin className="mr-1 h-3 w-3" />
                        {inviteData.invite.crew.location}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* 버튼 */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteCode("");
                  }}
                  className="flex-1 rounded-lg bg-zinc-800 px-4 py-3 font-medium text-white transition hover:bg-zinc-700"
                >
                  취소
                </button>
                <button
                  onClick={handleJoinByCode}
                  disabled={
                    inviteCode.length !== 8 || !inviteData?.invite || joinByInviteMutation.isPending
                  }
                  className="flex flex-1 items-center justify-center rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {joinByInviteMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      가입 중...
                    </>
                  ) : (
                    "가입하기"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CrewCard({ crew, index }: { crew: Crew; index: number }) {
  const memberCount = crew.member_count?.[0]?.count || 0;

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
              {crew.description && (
                <p className="line-clamp-2 text-sm text-zinc-400">{crew.description}</p>
              )}
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
              {memberCount}명{crew.max_members && ` / ${crew.max_members}명`}
            </div>
          </div>

          {/* 호버 인디케이터 */}
          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-orange-500 opacity-0 transition-opacity group-hover:opacity-100">
            자세히 보기 <TrendingUp className="h-4 w-4" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
