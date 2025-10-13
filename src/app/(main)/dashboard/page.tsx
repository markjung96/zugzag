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
import Link from "next/link";
import { useRouter } from "next/navigation";

import { mockEvents, mockCrews, mockAttendances, currentUser } from "@/lib/mock";
import { mockCrewMembers } from "@/lib/mock/crews";

export default function DashboardPage() {
  const router = useRouter();

  // 사용자가 속한 크루 찾기
  const userCrews = mockCrewMembers
    .filter((m) => m.user_id === currentUser.id)
    .map((m) => mockCrews.find((c) => c.id === m.crew_id))
    .filter(Boolean);

  // 사용자 크루의 일정들
  const crewEventIds = userCrews.map((c) => c!.id);
  const userEvents = mockEvents.filter((e) => crewEventIds.includes(e.crew_id));

  // 다가오는 일정
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingEvents = userEvents
    .filter((e) => new Date(e.event_date) >= today && !e.is_cancelled)
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
    .slice(0, 3);

  // 사용자의 참석 정보
  const userAttendances = mockAttendances.filter((a) => a.user_id === currentUser.id);
  const attendedCount = userAttendances.filter((a) => a.checked_in_at).length;
  const attendingCount = userAttendances.filter((a) => a.status === "attending").length;
  const thisMonthEvents = userEvents.filter((e) => {
    const eventDate = new Date(e.event_date);
    return (
      eventDate.getMonth() === today.getMonth() && eventDate.getFullYear() === today.getFullYear()
    );
  });

  // 인기 암장 통계
  const gymStats = userEvents.reduce(
    (acc, event) => {
      event.phases.forEach((phase) => {
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
    {} as Record<string, { gym: { id: string; name: string; address: string }; count: number }>,
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
      value: userCrews.length.toString(),
      icon: Users,
      color: "from-cyan-400 to-cyan-500",
    },
    {
      name: "이번 달 일정",
      value: thisMonthEvents.length.toString(),
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
        <h2 className="mb-2 text-2xl font-bold text-white md:text-3xl">
          안녕하세요, {currentUser.nickname || currentUser.full_name}님! 👋
        </h2>
        <p className="text-zinc-400">오늘도 즐거운 클라이밍 되세요</p>
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

          {upcomingEvents.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-12 text-center backdrop-blur-xl">
              <Calendar className="mx-auto mb-3 h-12 w-12 text-zinc-600" />
              <p className="text-sm text-zinc-400">다가오는 일정이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => {
                const userAttendance = userAttendances.find((a) => a.event_id === event.id);
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    onClick={() => router.push(`/events/${event.id}`)}
                    className="group cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl transition-all hover:border-orange-500/50 hover:bg-zinc-900"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h4 className="text-lg font-semibold text-white">{event.title}</h4>
                          {userAttendance && (
                            <span className="rounded-lg bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">
                              참석
                            </span>
                          )}
                        </div>
                        <div className="mb-2 text-xs text-zinc-500">{event.crew.name}</div>
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <Calendar className="h-4 w-4" />
                          {new Date(event.event_date).toLocaleDateString("ko-KR", {
                            month: "long",
                            day: "numeric",
                            weekday: "short",
                          })}{" "}
                          {event.phases[0]?.start_time}
                        </div>
                      </div>
                      <span className="rounded-full bg-orange-500/10 px-3 py-1 text-sm font-medium text-orange-500">
                        {event.stats?.attending_count || 0}명
                      </span>
                    </div>
                    {event.phases[0]?.gym && (
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <MapPin className="h-4 w-4" />
                        {event.phases[0].gym.name}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          <motion.button
            onClick={() => router.push("/events/create")}
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

            {userCrews.length === 0 ? (
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
                {userCrews.map((crew, idx) => (
                  <motion.div
                    key={crew!.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                    onClick={() => router.push(`/crews/${crew!.id}`)}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition-all hover:border-zinc-700"
                  >
                    <div>
                      <div className="font-semibold text-white">{crew!.name}</div>
                      <div className="text-sm text-zinc-400">{crew!.member_count}명</div>
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
              <span>참석률</span>
              <span className="text-2xl font-bold text-white">
                {thisMonthEvents.length > 0
                  ? Math.round(
                      (userAttendances.filter(
                        (a) => a.checked_in_at && thisMonthEvents.some((e) => e.id === a.event_id),
                      ).length /
                        thisMonthEvents.length) *
                        100,
                    )
                  : 0}
                %
              </span>
            </div>
            <div className="relative h-3 overflow-hidden rounded-full bg-zinc-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${
                    thisMonthEvents.length > 0
                      ? Math.round(
                          (userAttendances.filter(
                            (a) =>
                              a.checked_in_at && thisMonthEvents.some((e) => e.id === a.event_id),
                          ).length /
                            thisMonthEvents.length) *
                            100,
                        )
                      : 0
                  }%`,
                }}
                transition={{ delay: 1, duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-cyan-400"
              />
            </div>
            <p className="mt-3 text-xs text-zinc-500">
              이번 달 {thisMonthEvents.length}개 일정 중{" "}
              {
                userAttendances.filter(
                  (a) => a.checked_in_at && thisMonthEvents.some((e) => e.id === a.event_id),
                ).length
              }
              개 참석 💪
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
