"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  Calendar,
  Trophy,
  Clock,
  MapPin,
  ChevronRight,
  Plus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useCurrentUser } from "@/hooks/useCurrentUser";

import { useUserCrewsQuery } from "../crews/_hooks/use-user-crews-query";
import { useSchedulesQuery } from "../schedules/_hooks/use-schedules-query";

export default function DashboardPage() {
  const router = useRouter();

  // React Query로 데이터 조회
  const { data: currentUserData, isLoading: isLoadingUser } = useCurrentUser();
  const { data: userCrewsData, isLoading: isLoadingCrews } = useUserCrewsQuery();
  const { data: schedulesData, isLoading: isLoadingSchedules } = useSchedulesQuery({
    limit: 100, // Dashboard에서는 더 많은 일정을 가져옴
  });

  // 인증되지 않은 경우 로그인 페이지로
  if (!isLoadingUser && !currentUserData) {
    router.push("/login");
    return null;
  }

  if (isLoadingUser || isLoadingCrews || isLoadingSchedules) {
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
  const allSchedules = schedulesData?.schedules || [];

  // 사용자 크루의 일정만 필터링
  const crewIds = new Set(crews.map((c) => c.crew.id));
  const schedules = allSchedules.filter((s) => s.crew_id && crewIds.has(s.crew_id));

  // 다가오는 일정
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingSchedules = schedules
    .filter((e) => new Date(e.event_date) >= today && !e.is_cancelled)
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
    .slice(0, 3);

  // 사용자 통계 (간단 버전 - 참석 정보는 별도 API 필요)
  const thisMonthSchedules = schedules.filter((e) => {
    const eventDate = new Date(e.event_date);
    return (
      eventDate.getMonth() === today.getMonth() && eventDate.getFullYear() === today.getFullYear()
    );
  });

  // TODO: 참석 정보를 위한 별도 API 구현 필요
  const attendedCount = 0;
  const attendingCount = 0;

  // 인기 암장 통계
  const gymStats = schedules.reduce(
    (acc, schedule) => {
      schedule.phases.forEach((phase) => {
        if (phase.gym) {
          if (!acc[phase.gym.id]) {
            acc[phase.gym.id] = {
              gym: phase.gym,
              count: 0,
            };
          }
          acc[phase.gym.id].count++;
        }
      });
      return acc;
    },
    {} as Record<
      string,
      { gym: { id: string; name: string; address: string | null }; count: number }
    >,
  );

  const topGyms = Object.values(gymStats)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const stats = [
    {
      name: "참석한 일정",
      value: attendedCount.toString(),
      icon: Trophy,
      color: "from-orange-500 to-orange-600",
    },
    {
      name: "가입 크루",
      value: crews.length.toString(),
      icon: Users,
      color: "from-cyan-400 to-cyan-500",
    },
    {
      name: "이번 달 일정",
      value: thisMonthSchedules.length.toString(),
      icon: Calendar,
      color: "from-purple-500 to-purple-600",
    },
    {
      name: "참석 예정",
      value: attendingCount.toString(),
      icon: Clock,
      color: "from-green-500 to-green-600",
    },
  ];

  return (
    <div className="min-h-full bg-zinc-950 p-4 md:p-8">
      {/* Welcome Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-4">
          {profile?.avatar_url || user?.user_metadata?.avatar_url ? (
            <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-orange-500">
              <Image
                src={profile?.avatar_url || user?.user_metadata?.avatar_url}
                alt={profile?.nickname || profile?.full_name || "사용자"}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-orange-500 bg-gradient-to-r from-orange-500 to-cyan-400 text-2xl font-bold text-white">
              {
                (profile?.nickname ||
                  profile?.full_name ||
                  user?.user_metadata?.full_name ||
                  "크")?.[0]
              }
            </div>
          )}
          <div>
            <h2 className="mb-1 text-2xl font-bold text-white md:text-3xl">
              안녕하세요,{" "}
              {profile?.nickname ||
                profile?.full_name ||
                user?.user_metadata?.full_name ||
                "크루원"}
              님! 👋
            </h2>
            <p className="text-zinc-400">오늘도 즐거운 클라이밍 되세요</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl transition-all hover:border-zinc-700"
            >
              <div className="relative z-10">
                <div className={`mb-3 inline-flex rounded-xl bg-gradient-to-r ${stat.color} p-3`}>
                  <Icon className="h-5 w-5 text-white md:h-6 md:w-6" />
                </div>
                <p className="mb-1 text-2xl font-bold text-white md:text-3xl">{stat.value}</p>
                <p className="text-sm text-zinc-400 md:text-base">{stat.name}</p>
              </div>
              <motion.div
                className="absolute inset-0 -z-0 opacity-0 transition-opacity group-hover:opacity-100"
                style={{
                  background: `radial-gradient(circle at center, rgb(255 107 53 / 0.05), transparent 70%)`,
                }}
              />
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">다가오는 일정</h3>
            <Link href="/schedule">
              <button className="flex items-center gap-1 text-sm text-orange-500 transition-colors hover:text-orange-400">
                전체보기
                <ChevronRight className="h-4 w-4" />
              </button>
            </Link>
          </div>

          {upcomingSchedules.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-12 text-center backdrop-blur-xl">
              <Calendar className="mx-auto mb-3 h-12 w-12 text-zinc-600" />
              <p className="text-sm text-zinc-400">다가오는 일정이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingSchedules.map((schedule, index) => {
                return (
                  <motion.div
                    key={schedule.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    onClick={() => router.push(`/schedules/${schedule.id}`)}
                    className="group cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl transition-all hover:border-orange-500/50 hover:bg-zinc-900"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h4 className="text-lg font-semibold text-white">{schedule.title}</h4>
                        </div>
                        <div className="mb-2 text-xs text-zinc-500">
                          {schedule.crew?.name || "Unknown Crew"}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <Calendar className="h-4 w-4" />
                          {new Date(schedule.event_date).toLocaleDateString("ko-KR", {
                            month: "long",
                            day: "numeric",
                            weekday: "short",
                          })}{" "}
                          {schedule.phases[0]?.start_time}
                        </div>
                      </div>
                    </div>
                    {schedule.phases[0]?.gym && (
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <MapPin className="h-4 w-4" />
                        {schedule.phases[0].gym.name}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          <motion.button
            onClick={() => router.push("/schedules/create")}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 text-sm font-medium text-white transition-all hover:bg-zinc-800"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Plus className="h-4 w-4" />새 일정 만들기
          </motion.button>
        </motion.div>

        {/* Right Column */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          {/* 내 크루 */}
          <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">내 크루 👥</h3>
              <Link href="/crews">
                <button className="flex items-center gap-1 text-sm text-orange-500 transition-colors hover:text-orange-400">
                  전체보기
                  <ChevronRight className="h-4 w-4" />
                </button>
              </Link>
            </div>

            {crews.length === 0 ? (
              <div className="py-8 text-center">
                <Users className="mx-auto mb-3 h-12 w-12 text-zinc-600" />
                <p className="mb-4 text-sm text-zinc-400">가입된 크루가 없습니다</p>
                <button
                  onClick={() => router.push("/crews")}
                  className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
                >
                  크루 찾아보기
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {crews.map((crewMembership, idx) => (
                  <motion.div
                    key={crewMembership.crew.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                    onClick={() => router.push(`/crews/${crewMembership.crew.id}`)}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition-all hover:border-zinc-700"
                  >
                    <div>
                      <div className="font-semibold text-white">{crewMembership.crew.name}</div>
                      <div className="text-sm text-zinc-400">멤버</div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-zinc-600" />
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* 인기 암장 */}
          {topGyms.length > 0 && (
            <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">자주 가는 암장 🔥</h3>
              </div>

              <div className="space-y-3">
                {topGyms.map((gymStat, idx) => (
                  <motion.div
                    key={gymStat.gym.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                    className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition-all hover:border-zinc-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-lg font-bold text-white">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{gymStat.gym.name}</div>
                        <div className="text-sm text-zinc-400">{gymStat.count}회</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-semibold text-white">이번 달 활동</h4>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="mb-2 flex items-end justify-between text-sm text-zinc-400">
              <span>이번 달 일정</span>
              <span className="text-2xl font-bold text-white">{thisMonthSchedules.length}</span>
            </div>
            <p className="mt-3 text-xs text-zinc-500">
              이번 달 일정 {thisMonthSchedules.length}개 💪
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
