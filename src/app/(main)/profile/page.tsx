"use client";

import { motion } from "framer-motion";
import {
  User,
  Mail,
  MapPin,
  Edit,
  TrendingUp,
  Calendar,
  Award,
  Target,
  Settings,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { currentUser, mockAttendances, mockEvents } from "@/lib/mock";
import { mockCrewMembers } from "@/lib/mock/crews";

export default function ProfilePage() {
  const router = useRouter();

  // 사용자 통계
  const userAttendances = mockAttendances.filter((a) => a.user_id === currentUser.id);
  const attendedCount = userAttendances.filter((a) => a.checked_in_at).length;
  const totalEvents = userAttendances.filter((a) => a.status === "attending").length;
  const noShowCount = userAttendances.filter((a) => a.status === "no_show").length;
  const attendanceRate = totalEvents > 0 ? Math.round((attendedCount / totalEvents) * 100) : 0;

  // 가입 크루 수
  const userCrewCount = mockCrewMembers.filter((m) => m.user_id === currentUser.id).length;

  // 이번 달 활동
  const today = new Date();
  const thisMonthAttendances = userAttendances.filter((a) => {
    const event = mockEvents.find((e) => e.id === a.event_id);
    if (!event) return false;
    const eventDate = new Date(event.event_date);
    return (
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear() &&
      a.checked_in_at
    );
  });

  const stats = [
    {
      label: "총 참석",
      value: attendedCount,
      icon: Calendar,
      color: "from-orange-500 to-orange-600",
    },
    {
      label: "출석률",
      value: `${attendanceRate}%`,
      icon: TrendingUp,
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
      value: currentUser.climbing_level || "V0",
      icon: Target,
      color: "from-purple-500 to-purple-600",
    },
  ];

  const handleLogout = () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      // TODO: 실제 로그아웃 처리
      router.push("/login");
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
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-cyan-400 text-3xl font-bold text-white">
                {currentUser.nickname?.[0] || currentUser.full_name[0]}
              </div>
              <button className="absolute right-0 bottom-0 rounded-full bg-orange-500 p-2 text-white transition-colors hover:bg-orange-600">
                <Edit className="h-4 w-4" />
              </button>
            </div>

            {/* 정보 */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="mb-1 text-2xl font-bold text-white">
                {currentUser.nickname || currentUser.full_name}
              </h2>
              {currentUser.nickname && (
                <p className="mb-3 text-zinc-400">{currentUser.full_name}</p>
              )}

              {currentUser.bio && <p className="mb-4 text-sm text-zinc-400">{currentUser.bio}</p>}

              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-zinc-400 md:justify-start">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {currentUser.email}
                </div>
                {currentUser.climbing_level && (
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    {currentUser.climbing_level}
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
                className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm font-medium text-white transition-all hover:border-zinc-700 hover:bg-zinc-800"
              >
                <Edit className="h-4 w-4" />
                수정
              </button>
              <button className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-2 text-zinc-400 transition-all hover:border-zinc-700 hover:bg-zinc-800 hover:text-white">
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* 통계 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-4 md:grid-cols-4"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
              >
                <div
                  className={`mb-3 inline-flex rounded-lg bg-gradient-to-r p-2 text-white ${stat.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mb-1 text-sm text-zinc-400">{stat.label}</div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
              </div>
            );
          })}
        </motion.div>

        {/* 활동 내역 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
        >
          <h2 className="mb-4 text-xl font-bold text-white">최근 활동</h2>

          {userAttendances.length === 0 ? (
            <div className="py-12 text-center">
              <Calendar className="mx-auto mb-3 h-12 w-12 text-zinc-600" />
              <p className="text-sm text-zinc-400">활동 내역이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userAttendances.slice(0, 5).map((attendance) => {
                const event = mockEvents.find((e) => e.id === attendance.event_id);
                if (!event) return null;

                return (
                  <div
                    key={attendance.id}
                    className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
                  >
                    <div>
                      <div className="mb-1 font-semibold text-white">{event.title}</div>
                      <div className="text-xs text-zinc-500">
                        {new Date(event.event_date).toLocaleDateString("ko-KR")} · {event.crew.name}
                      </div>
                    </div>
                    <div>
                      {attendance.checked_in_at ? (
                        <span className="rounded-lg bg-green-500/10 px-3 py-1 text-sm font-medium text-green-500">
                          참석
                        </span>
                      ) : attendance.status === "attending" ? (
                        <span className="rounded-lg bg-orange-500/10 px-3 py-1 text-sm font-medium text-orange-500">
                          예정
                        </span>
                      ) : attendance.status === "no_show" ? (
                        <span className="rounded-lg bg-red-500/10 px-3 py-1 text-sm font-medium text-red-500">
                          노쇼
                        </span>
                      ) : (
                        <span className="rounded-lg bg-zinc-800/50 px-3 py-1 text-sm font-medium text-zinc-400">
                          {attendance.status}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {userAttendances.length > 5 && (
            <button
              onClick={() => router.push("/profile/stats")}
              className="mt-4 w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2 text-sm font-medium text-white transition-all hover:bg-zinc-800"
            >
              전체 보기
            </button>
          )}
        </motion.div>

        {/* 선호 암장 */}
        {currentUser.preferred_gyms && currentUser.preferred_gyms.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-500" />
              <h2 className="text-xl font-bold text-white">선호 암장</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentUser.preferred_gyms.map((gymId) => (
                <span
                  key={gymId}
                  className="rounded-lg bg-zinc-800/50 px-3 py-1.5 text-sm text-zinc-300"
                >
                  암장 #{gymId.slice(0, 8)}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* 경고 사항 */}
        {noShowCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-6 backdrop-blur-xl"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-yellow-500/10 p-2">
                <Award className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-white">주의</h3>
                <p className="text-sm text-zinc-400">
                  노쇼 {noShowCount}회가 기록되어 있습니다. 일정 참석 시 사전에 변경해주세요.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 로그아웃 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-3 font-medium text-red-500 transition-all hover:bg-red-500/20"
          >
            <LogOut className="h-5 w-5" />
            로그아웃
          </button>
        </motion.div>
      </div>
    </div>
  );
}

