"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Calendar,
  MapPin,
  Clock,
  UserX,
  Award,
  AlertTriangle,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

import { mockCrews, mockEvents, mockAttendances, type MockCrew } from "@/lib/mock";

export default function CrewStatsPage() {
  const router = useRouter();
  const params = useParams();
  const crewId = params.id as string;

  const [crew, setCrew] = useState<MockCrew | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const foundCrew = mockCrews.find((c) => c.id === crewId);
    setCrew(foundCrew || null);
    setLoading(false);
  }, [crewId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-orange-500" />
          <p className="text-sm text-zinc-400">불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!crew) {
    return null;
  }

  // 통계 계산
  const crewEvents = mockEvents.filter((e) => e.crew_id === crewId);
  const pastEvents = crewEvents.filter((e) => new Date(e.event_date) < new Date());
  const upcomingEvents = crewEvents.filter((e) => new Date(e.event_date) >= new Date());

  const allAttendances = mockAttendances.filter((a) => crewEvents.some((e) => e.id === a.event_id));
  const checkedInCount = allAttendances.filter((a) => a.checked_in_at).length;
  const noShowCount = allAttendances.filter((a) => a.status === "no_show").length;
  const totalAttending = allAttendances.filter((a) => a.status === "attending").length;
  const attendanceRate = totalAttending > 0 ? (checkedInCount / totalAttending) * 100 : 0;

  // 멤버별 통계
  const memberStats = Array.from(
    allAttendances.reduce((acc, a) => {
      if (!acc.has(a.user_id)) {
        acc.set(a.user_id, {
          user: a.user,
          total: 0,
          attended: 0,
          noShow: 0,
        });
      }
      const stat = acc.get(a.user_id)!;
      if (a.status === "attending") stat.total++;
      if (a.checked_in_at) stat.attended++;
      if (a.status === "no_show") stat.noShow++;
      return acc;
    }, new Map()),
  )
    .map(([_, stat]) => stat)
    .sort((a, b) => b.attended - a.attended);

  // 암장별 통계
  const gymStats = crewEvents.reduce(
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
    .slice(0, 5);

  // 요일별 통계
  const dayStats = crewEvents.reduce(
    (acc, event) => {
      const day = new Date(event.event_date).getDay();
      acc[day]++;
      return acc;
    },
    [0, 0, 0, 0, 0, 0, 0],
  );

  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      {/* 헤더 */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-zinc-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
          뒤로가기
        </button>
        <h1 className="text-3xl font-bold text-white">크루 통계</h1>
        <p className="mt-2 text-zinc-400">{crew.name} 활동 분석</p>
      </motion.div>

      <div className="mx-auto max-w-7xl space-y-6">
        {/* 핵심 지표 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 md:grid-cols-4"
        >
          <StatCard
            icon={<Calendar className="h-6 w-6" />}
            label="총 일정"
            value={crewEvents.length}
            color="from-orange-500 to-orange-600"
          />
          <StatCard
            icon={<TrendingUp className="h-6 w-6" />}
            label="출석률"
            value={`${attendanceRate.toFixed(0)}%`}
            color="from-green-500 to-green-600"
          />
          <StatCard
            icon={<Users className="h-6 w-6" />}
            label="총 참석"
            value={checkedInCount}
            color="from-cyan-400 to-cyan-500"
          />
          <StatCard
            icon={<UserX className="h-6 w-6" />}
            label="노쇼"
            value={noShowCount}
            color="from-red-500 to-red-600"
          />
        </motion.div>

        {/* 일정 현황 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
        >
          <h2 className="mb-4 text-xl font-bold text-white">일정 현황</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="mb-2 text-sm text-zinc-400">다가오는 일정</div>
              <div className="text-3xl font-bold text-white">{upcomingEvents.length}개</div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="mb-2 text-sm text-zinc-400">완료된 일정</div>
              <div className="text-3xl font-bold text-white">{pastEvents.length}개</div>
            </div>
          </div>
        </motion.div>

        {/* 멤버별 참석 통계 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
        >
          <div className="mb-4 flex items-center gap-2">
            <Award className="h-6 w-6 text-orange-500" />
            <h2 className="text-xl font-bold text-white">멤버별 참석 통계</h2>
          </div>

          {memberStats.length === 0 ? (
            <div className="py-8 text-center text-zinc-400">통계 데이터가 없습니다</div>
          ) : (
            <div className="space-y-3">
              {memberStats.slice(0, 10).map((stat, index) => (
                <div
                  key={stat.user.id}
                  className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-cyan-400 text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-white">
                      {stat.user.nickname || stat.user.full_name}
                    </div>
                    <div className="mt-1 flex gap-4 text-xs text-zinc-400">
                      <span>참석: {stat.attended}회</span>
                      <span>총 신청: {stat.total}회</span>
                      {stat.noShow > 0 && (
                        <span className="text-red-500">노쇼: {stat.noShow}회</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-500">
                      {stat.total > 0 ? Math.round((stat.attended / stat.total) * 100) : 0}%
                    </div>
                    <div className="text-xs text-zinc-500">출석률</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* 인기 암장 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
        >
          <div className="mb-4 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-green-500" />
            <h2 className="text-xl font-bold text-white">인기 암장</h2>
          </div>

          {topGyms.length === 0 ? (
            <div className="py-8 text-center text-zinc-400">통계 데이터가 없습니다</div>
          ) : (
            <div className="space-y-3">
              {topGyms.map((gymStat, index) => (
                <div
                  key={gymStat.gym.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-sm font-bold text-green-500">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{gymStat.gym.name}</div>
                      <div className="text-xs text-zinc-400">{gymStat.gym.address}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">{gymStat.count}회</div>
                    <div className="text-xs text-zinc-500">방문</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* 요일별 선호도 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
        >
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-6 w-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">요일별 일정 분포</h2>
          </div>

          <div className="space-y-3">
            {dayNames.map((day, index) => {
              const count = dayStats[index];
              const maxCount = Math.max(...dayStats);
              const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

              return (
                <div key={day} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-zinc-300">{day}요일</span>
                    <span className="text-zinc-400">{count}회</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: 0.5 + index * 0.05 }}
                      className="h-full bg-gradient-to-r from-cyan-400 to-cyan-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* 주의 사항 */}
        {noShowCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-6 backdrop-blur-xl"
          >
            <div className="mb-3 flex items-center gap-2 text-yellow-500">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-semibold">주의가 필요한 사항</h3>
            </div>
            <p className="text-sm text-zinc-300">
              총 {noShowCount}건의 노쇼가 발생했습니다. 크루원들과 참석 확인을 더욱 철저히 해주세요.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl">
      <div className={`mb-3 inline-flex rounded-lg bg-gradient-to-r p-2 text-white ${color}`}>
        {icon}
      </div>
      <div className="mb-1 text-sm text-zinc-400">{label}</div>
      <div className="text-3xl font-bold text-white">{value}</div>
    </div>
  );
}

