"use client";

import { motion } from "framer-motion";
import { User, Mail, Edit, TrendingUp, Calendar, Award, Target, LogOut } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { signOut } from "@/lib/auth/auth-helpers";

import { useUserCrewsQuery } from "../crews/_hooks/use-user-crews-query";

export default function ProfilePage() {
  const router = useRouter();
  const { data: currentUserData, isLoading: isLoadingUser } = useCurrentUser();
  const { data: userCrewsData, isLoading: isLoadingCrews } = useUserCrewsQuery();

  // 인증되지 않은 경우 로그인 페이지로
  if (!isLoadingUser && !currentUserData) {
    router.push("/login");
    return null;
  }

  if (isLoadingUser || isLoadingCrews) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
          <p className="text-zinc-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  const user = currentUserData?.user;
  const profile = currentUserData?.profile;
  const crews = userCrewsData?.crews || [];

  // 사용자 통계 (TODO: 실제 출석 데이터 API 필요)
  const attendedCount = 0;
  const attendanceRate = 0;
  const userCrewCount = crews.length;
  const thisMonthAttendances: never[] = [];

  const stats = [
    {
      label: "총 참석",
      value: attendedCount,
      icon: TrendingUp,
      color: "from-orange-500 to-orange-600",
    },
    {
      label: "참석률",
      value: `${attendanceRate}%`,
      icon: Award,
      color: "from-green-500 to-green-600",
    },
    {
      label: "이번 달",
      value: thisMonthAttendances.length,
      icon: Award,
      color: "from-cyan-400 to-cyan-500",
    },
    {
      label: "레벨",
      value: profile?.climbing_level || "V0",
      icon: Target,
      color: "from-purple-500 to-purple-600",
    },
  ];

  const handleLogout = async () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      try {
        await signOut();
        router.push("/login");
      } catch (error) {
        console.error("로그아웃 실패:", error);
        alert("로그아웃에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      {/* 헤더 */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-bold text-white">프로필</h1>
        <p className="mt-1 text-zinc-400">내 정보와 활동 내역</p>
      </motion.div>

      <div className="mx-auto max-w-4xl space-y-6">
        {/* 프로필 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl md:p-8"
        >
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            {/* 아바타 */}
            <div className="relative">
              {profile?.avatar_url || user?.user_metadata?.avatar_url ? (
                <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-orange-500">
                  <Image
                    src={profile?.avatar_url || user?.user_metadata?.avatar_url}
                    alt={profile?.full_name || "사용자"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-cyan-400 text-3xl font-bold text-white">
                  {
                    (profile?.nickname ||
                      profile?.full_name ||
                      user?.user_metadata?.full_name ||
                      "U")?.[0]
                  }
                </div>
              )}
              <button className="absolute right-0 bottom-0 rounded-full bg-orange-500 p-2 text-white transition-colors hover:bg-orange-600">
                <Edit className="h-4 w-4" />
              </button>
            </div>

            {/* 정보 */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="mb-1 text-2xl font-bold text-white">
                {profile?.nickname ||
                  profile?.full_name ||
                  user?.user_metadata?.full_name ||
                  "크루원"}
              </h2>
              {profile?.nickname && profile?.full_name && (
                <p className="mb-3 text-zinc-400">{profile.full_name}</p>
              )}

              {profile?.bio && <p className="mb-4 text-sm text-zinc-400">{profile.bio}</p>}

              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-zinc-400 md:justify-start">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {user?.email}
                </div>
                {profile?.climbing_level && (
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    {profile.climbing_level === "beginner"
                      ? "입문"
                      : profile.climbing_level === "intermediate"
                        ? "중급"
                        : profile.climbing_level === "advanced"
                          ? "고급"
                          : "전문가"}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {userCrewCount}개 크루
                </div>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-2">
              <button
                onClick={() => router.push("/profile/edit")}
                className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
              >
                프로필 수정
              </button>
            </div>
          </div>
        </motion.div>

        {/* 통계 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid gap-4 md:grid-cols-4">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
                >
                  <div className={`mb-3 inline-flex rounded-lg bg-gradient-to-r ${stat.color} p-3`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="mt-1 text-sm text-zinc-400">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* 활동 내역 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
        >
          <h2 className="mb-4 text-xl font-bold text-white">최근 활동</h2>

          <div className="py-12 text-center">
            <Calendar className="mx-auto mb-3 h-12 w-12 text-zinc-600" />
            <p className="text-sm text-zinc-400">활동 내역 기능 개발 중</p>
          </div>
        </motion.div>

        {/* 로그아웃 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/5 p-4 text-red-400 transition-colors hover:bg-red-500/10"
          >
            <LogOut className="h-5 w-5" />
            로그아웃
          </button>
        </motion.div>
      </div>
    </div>
  );
}
