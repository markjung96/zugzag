"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Users, MapPin, Loader2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

import { useToast } from "@/components/toast-provider";
import { useCurrentUser } from "@/hooks/useCurrentUser";

import { useInviteByCodeQuery, useJoinByInviteMutation } from "../../_hooks";

export default function JoinByInvitePage() {
  const router = useRouter();
  const params = useParams();
  const inviteCode = params.code as string;
  const toast = useToast();

  const [isJoining, setIsJoining] = useState(false);

  // React Query로 현재 사용자 정보 조회
  const { data: currentUserData, isLoading: isLoadingUser, error: _userError } = useCurrentUser();

  const { data, isLoading, error } = useInviteByCodeQuery(inviteCode?.toUpperCase() || null);
  const joinMutation = useJoinByInviteMutation();

  const invite = data?.invite;
  const crew = invite?.crew;

  // 인증 상태 및 프로필 완성도 확인
  const user = currentUserData ? currentUserData.user : null;
  const profile = currentUserData ? currentUserData.profile : null;
  // 프로필 완성도: climbing_level이 설정되어 있으면 온보딩 완료로 간주
  const hasProfile = !!(profile && profile.climbing_level);

  // inviteCode가 없으면 리다이렉트
  useEffect(() => {
    if (!inviteCode) {
      router.push("/crews");
    }
  }, [inviteCode, router]);

  const handleJoin = async () => {
    if (!inviteCode || !crew) return;

    // 1. 인증 상태 확인
    if (!user) {
      toast.info(`${crew.name} 크루에 가입하려면 먼저 회원가입이 필요합니다`);
      router.push(`/signup?invite=${inviteCode.toUpperCase()}`);
      return;
    }

    // 2. 프로필 완성도 확인
    if (!hasProfile) {
      toast.info(`${crew.name} 크루에 가입하려면 프로필을 완성해주세요`);
      router.push(`/onboarding?invite=${inviteCode.toUpperCase()}`);
      return;
    }

    // 3. 모든 조건 만족 시 크루 가입
    setIsJoining(true);
    try {
      const result = await joinMutation.mutateAsync(inviteCode.toUpperCase());
      toast.success(`${result.crew.name} 크루에 가입되었습니다!`);
      router.push(`/crews/${result.crew.id}`);
    } catch (err) {
      console.error("Error joining crew:", err);

      // 온보딩이 필요한 경우 (예상치 못한 케이스)
      if (err instanceof Error && err.message.includes("ONBOARDING_REQUIRED")) {
        toast.error("먼저 프로필을 완성해주세요");
        router.push(`/onboarding?invite=${inviteCode.toUpperCase()}`);
        return;
      }

      toast.error(err instanceof Error ? err.message : "크루 가입에 실패했습니다");
      setIsJoining(false);
    }
  };

  // 초기 로딩 중 (사용자 정보 또는 초대 정보)
  if (isLoadingUser || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-orange-500" />
          <p className="text-sm text-zinc-400">
            {isLoadingUser ? "인증 확인 중..." : "초대 정보를 확인하는 중..."}
          </p>
        </div>
      </div>
    );
  }

  if (error || !invite || !crew) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-8">
            <XCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
            <h1 className="mb-2 text-2xl font-bold text-white">초대 링크를 찾을 수 없습니다</h1>
            <p className="text-zinc-400">
              {error instanceof Error ? error.message : "유효하지 않거나 만료된 초대 링크입니다"}
            </p>
          </div>
          <Link
            href="/crews"
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-6 py-3 font-semibold text-white transition-colors hover:bg-zinc-700"
          >
            <ArrowLeft className="h-5 w-5" />
            크루 목록으로
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        {/* 헤더 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Link
            href="/crews"
            className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            크루 목록으로
          </Link>
        </motion.div>

        {/* 초대 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-xl"
        >
          <div className="mb-6 text-center">
            <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-cyan-400">
              <Users className="h-10 w-10 text-white" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-white">크루 초대</h1>
            <p className="text-zinc-400">다음 크루에 초대되었습니다</p>
          </div>

          {/* 크루 정보 */}
          <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            {crew.logo_url && (
              <div className="mb-4 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={crew.logo_url}
                  alt={crew.name}
                  className="h-24 w-24 rounded-full object-cover"
                />
              </div>
            )}
            <h2 className="mb-2 text-center text-2xl font-bold text-white">{crew.name}</h2>
            {crew.description && (
              <p className="mb-4 text-center text-zinc-400">{crew.description}</p>
            )}

            <div className="flex flex-wrap justify-center gap-4 text-sm text-zinc-400">
              {crew.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {crew.location}
                </div>
              )}
              {crew.max_members && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  정원 {crew.max_members}명
                </div>
              )}
              {!crew.is_public && (
                <div className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs">비공개</div>
              )}
            </div>
          </div>

          {/* 초대 정보 */}
          <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
            <div className="mb-2 text-center text-xs font-semibold tracking-wider text-zinc-500 uppercase">
              초대 코드
            </div>
            <div className="text-center">
              <code className="inline-block rounded bg-zinc-800 px-4 py-2 font-mono text-lg text-cyan-400">
                {invite.invite_code}
              </code>
            </div>
          </div>

          {/* 가입 버튼 */}
          <div className="flex flex-col gap-3">
            {/* 인증 상태 안내 */}
            {!user && (
              <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-3 text-center text-sm text-orange-300">
                🔐 크루에 가입하려면 먼저 회원가입이 필요합니다
              </div>
            )}
            {user && !hasProfile && (
              <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-3 text-center text-sm text-cyan-300">
                ✏️ 크루 가입 전에 프로필을 완성해주세요
              </div>
            )}

            <button
              onClick={handleJoin}
              disabled={isJoining || joinMutation.isPending}
              className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-cyan-400 px-6 py-3 font-bold text-white transition-all hover:shadow-lg hover:shadow-orange-500/30 disabled:opacity-50"
            >
              {isJoining || joinMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  가입 중...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  {!user
                    ? "회원가입하고 가입하기"
                    : !hasProfile
                      ? "프로필 완성하고 가입하기"
                      : "크루 가입하기"}
                </>
              )}
            </button>

            <Link
              href="/crews"
              className="rounded-lg border border-zinc-700 px-6 py-3 text-center font-semibold text-zinc-400 transition-colors hover:border-zinc-600 hover:text-white"
            >
              나중에 하기
            </Link>
          </div>

          {/* 추가 정보 */}
          <div className="mt-6 text-center text-xs text-zinc-500">
            {invite.max_uses && (
              <p>
                이 초대 링크는 {invite.max_uses}번 사용 가능합니다 (현재 {invite.current_uses}번
                사용됨)
              </p>
            )}
            {invite.expires_at && (
              <p className="mt-1">
                만료 시간:{" "}
                {new Date(invite.expires_at).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
