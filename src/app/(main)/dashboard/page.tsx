"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, Calendar, Trophy, Clock, MapPin, ChevronRight } from "lucide-react";

export default function DashboardPage() {
  // 임시 데이터
  const stats = [
    { name: "완등 횟수", value: "42", icon: Trophy, color: "from-orange-500 to-orange-600" },
    { name: "크루원", value: "12", icon: Users, color: "from-cyan-400 to-cyan-500" },
    { name: "이번 달 방문", value: "8", icon: Calendar, color: "from-purple-500 to-purple-600" },
    { name: "총 시간", value: "24h", icon: Clock, color: "from-green-500 to-green-600" },
  ];

  const upcomingSessions = [
    {
      id: 1,
      title: "더클라임 강남점",
      date: "2025년 10월 12일",
      time: "오후 7:00",
      participants: 5,
      location: "강남구 테헤란로",
    },
    {
      id: 2,
      title: "클라이밍파크",
      date: "2025년 10월 15일",
      time: "오후 6:30",
      participants: 3,
      location: "마포구 와우산로",
    },
  ];

  const recentAchievements = [
    { id: 1, title: "V5 완등!", date: "2일 전", difficulty: "V5" },
    { id: 2, title: "100회 방문", date: "1주 전", difficulty: "" },
    { id: 3, title: "V4 완등!", date: "2주 전", difficulty: "V4" },
  ];

  return (
    <div className="min-h-full bg-zinc-950 p-4 md:p-8">
      {/* Welcome Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h2 className="mb-2 text-2xl font-bold text-white md:text-3xl">안녕하세요, 크루원님! 👋</h2>
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
        {/* Upcoming Sessions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">다가오는 일정</h3>
            <button className="flex items-center gap-1 text-sm text-orange-500 transition-colors hover:text-orange-400">
              전체보기
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            {upcomingSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="group cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl transition-all hover:border-zinc-700 hover:bg-zinc-900"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h4 className="mb-1 text-lg font-semibold text-white">{session.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Calendar className="h-4 w-4" />
                      {session.date} {session.time}
                    </div>
                  </div>
                  <span className="rounded-full bg-orange-500/10 px-3 py-1 text-sm font-medium text-orange-500">
                    {session.participants}명 참여
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <MapPin className="h-4 w-4" />
                  {session.location}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.button
            className="mt-4 w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 text-sm font-medium text-white transition-all hover:bg-zinc-800"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            새 세션 만들기
          </motion.button>
        </motion.div>

        {/* Recent Achievements & Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          {/* 인기 암장 위젯 */}
          <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">인기 암장 🔥</h3>
              <button className="flex items-center gap-1 text-sm text-orange-500 transition-colors hover:text-orange-400">
                전체보기
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { name: "더클라임 강남점", visits: 24, trend: "+12%" },
                { name: "클라이밍파크 신림점", visits: 18, trend: "+8%" },
                { name: "더클라임 홍대점", visits: 15, trend: "+5%" },
              ].map((gym, idx) => (
                <motion.div
                  key={gym.name}
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
                      <div className="font-semibold text-white">{gym.name}</div>
                      <div className="text-sm text-zinc-400">{gym.visits}회 방문</div>
                    </div>
                  </div>
                  <div className="rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-500">
                    {gym.trend}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">최근 성과</h3>
            <button className="flex items-center gap-1 text-sm text-cyan-400 transition-colors hover:text-cyan-300">
              전체보기
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            {recentAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-cyan-400">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="mb-1 font-semibold text-white">{achievement.title}</h4>
                  <p className="text-sm text-zinc-400">{achievement.date}</p>
                </div>
                {achievement.difficulty && (
                  <span className="rounded-full bg-gradient-to-r from-orange-500/10 to-cyan-400/10 px-3 py-1 text-sm font-bold text-orange-500">
                    {achievement.difficulty}
                  </span>
                )}
              </motion.div>
            ))}
          </div>

          {/* Progress Chart Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-semibold text-white">이번 달 진행상황</h4>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="mb-2 flex items-end justify-between text-sm text-zinc-400">
              <span>목표 대비</span>
              <span className="text-2xl font-bold text-white">73%</span>
            </div>
            <div className="relative h-3 overflow-hidden rounded-full bg-zinc-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "73%" }}
                transition={{ delay: 1, duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-cyan-400"
              />
            </div>
            <p className="mt-3 text-xs text-zinc-500">목표까지 3회 남았습니다. 화이팅! 💪</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
