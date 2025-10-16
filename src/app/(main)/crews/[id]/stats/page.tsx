"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Calendar,
  MapPin,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle2,
  Activity,
  BarChart3,
  PieChart,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import type {
  MemberGrowthData,
  MemberAttendanceStat,
  GymStat,
  DayDistributionData,
  TimeDistributionData,
} from "@/lib/api/crew-stats-helpers";

import { useCrewStatsQuery } from "../../_hooks";

export default function CrewStatsPage() {
  const params = useParams();
  const crewId = params.id as string;

  const { data, isLoading, error } = useCrewStatsQuery(crewId);
  const stats = data?.stats;

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

  if (error || !stats) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h2 className="mb-2 text-xl font-bold text-white">통계를 불러올 수 없습니다</h2>
          <p className="mb-6 text-zinc-400">
            {error instanceof Error ? error.message : "통계 조회에 실패했습니다"}
          </p>
          <Link
            href={`/crews/${crewId}`}
            className="rounded-xl bg-orange-500 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-600"
          >
            크루로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      {/* 헤더 */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <Link
          href={`/crews/${crewId}`}
          className="mb-4 inline-flex items-center gap-2 text-zinc-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
          크루로 돌아가기
        </Link>
        <h1 className="text-3xl font-bold text-white">크루 통계</h1>
        <p className="mt-2 text-zinc-400">{stats.crew.name} 활동 분석</p>
      </motion.div>

      <div className="mx-auto max-w-7xl space-y-6">
        {/* 핵심 지표 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          <StatCard
            icon={<Users className="h-6 w-6" />}
            label="크루원"
            value={stats.totalMembers}
            color="from-orange-500 to-orange-600"
            suffix="명"
          />
          <StatCard
            icon={<Calendar className="h-6 w-6" />}
            label="총 일정"
            value={stats.totalSchedules}
            color="from-cyan-400 to-cyan-500"
            suffix="개"
          />
          <StatCard
            icon={<CheckCircle2 className="h-6 w-6" />}
            label="출석률"
            value={stats.attendanceRate.toFixed(1)}
            color="from-green-500 to-green-600"
            suffix="%"
          />
          <StatCard
            icon={<TrendingUp className="h-6 w-6" />}
            label="평균 참석자"
            value={stats.averageAttendees.toFixed(1)}
            color="from-purple-500 to-purple-600"
            suffix="명"
          />
        </motion.div>

        {/* 추가 지표 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="grid gap-4 md:grid-cols-4"
        >
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-xl">
            <div className="mb-2 text-sm text-zinc-400">완료된 일정</div>
            <div className="text-2xl font-bold text-white">{stats.completedSchedules}개</div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-xl">
            <div className="mb-2 text-sm text-zinc-400">노쇼율</div>
            <div className="text-2xl font-bold text-red-400">{stats.noShowRate.toFixed(1)}%</div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-xl">
            <div className="mb-2 text-sm text-zinc-400">신규 멤버 전환율</div>
            <div className="text-2xl font-bold text-green-400">
              {stats.newMemberConversionRate.toFixed(1)}%
            </div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-xl">
            <div className="mb-2 text-sm text-zinc-400">단계별 이탈률</div>
            <div className="text-2xl font-bold text-yellow-400">
              {stats.phaseDropoffRate.toFixed(1)}%
            </div>
          </div>
        </motion.div>

        {/* 일정 현황 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
        >
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-6 w-6 text-orange-500" />
            <h2 className="text-xl font-bold text-white">일정 현황</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="mb-2 text-sm text-zinc-400">다가오는 일정</div>
              <div className="text-3xl font-bold text-white">{stats.upcomingSchedules}개</div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="mb-2 text-sm text-zinc-400">완료된 일정</div>
              <div className="text-3xl font-bold text-white">{stats.completedSchedules}개</div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="mb-2 text-sm text-zinc-400">총 참석 기록</div>
              <div className="text-3xl font-bold text-white">{stats.checkedInCount}회</div>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 멤버 성장 추이 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-green-500" />
              <h2 className="text-xl font-bold text-white">크루원 증가 추이</h2>
            </div>

            {stats.memberGrowth.length === 0 ? (
              <div className="py-8 text-center text-zinc-400">데이터가 없습니다</div>
            ) : (
              <div className="space-y-3">
                {stats.memberGrowth.map((item: MemberGrowthData, index: number) => {
                  const maxCount = Math.max(
                    ...stats.memberGrowth.map((d: MemberGrowthData) => d.count),
                  );
                  const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                  const [year, month] = item.month.split("-");

                  return (
                    <div key={item.month} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-zinc-300">
                          {year}년 {month}월
                        </span>
                        <span className="flex gap-2">
                          <span className="text-zinc-400">{item.count}명</span>
                          {item.newMembers > 0 && (
                            <span className="text-green-500">+{item.newMembers}</span>
                          )}
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
                          className="h-full bg-gradient-to-r from-green-500 to-green-600"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* 요일별 일정 분포 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center gap-2">
              <Clock className="h-6 w-6 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">요일별 일정 분포</h2>
            </div>

            <div className="space-y-3">
              {stats.dayDistribution.map((item: DayDistributionData, index: number) => {
                const maxCount = Math.max(
                  ...stats.dayDistribution.map((d: DayDistributionData) => d.count),
                );
                const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;

                return (
                  <div key={item.dayOfWeek} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-zinc-300">{item.day}요일</span>
                      <span className="text-zinc-400">{item.count}회</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: 0.25 + index * 0.05 }}
                        className="h-full bg-gradient-to-r from-cyan-400 to-cyan-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* 시간대별 분포 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
        >
          <div className="mb-4 flex items-center gap-2">
            <PieChart className="h-6 w-6 text-purple-500" />
            <h2 className="text-xl font-bold text-white">시간대별 일정 선호도</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {stats.timeDistribution.map((item: TimeDistributionData, index: number) => {
              const totalCount = stats.timeDistribution.reduce(
                (acc: number, d: TimeDistributionData) => acc + d.count,
                0,
              );
              const percentage = totalCount > 0 ? (item.count / totalCount) * 100 : 0;
              const colors = [
                "from-orange-500 to-orange-600",
                "from-cyan-400 to-cyan-500",
                "from-purple-500 to-purple-600",
              ];

              return (
                <div
                  key={index}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center"
                >
                  <div className="mb-2 text-sm text-zinc-400">{item.timeSlot}</div>
                  <div className="mb-1 text-3xl font-bold text-white">{item.count}</div>
                  <div className="text-xs text-zinc-500">{percentage.toFixed(1)}%</div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                      className={`h-full bg-gradient-to-r ${colors[index]}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* 멤버별 참석 통계 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
        >
          <div className="mb-4 flex items-center gap-2">
            <Award className="h-6 w-6 text-orange-500" />
            <h2 className="text-xl font-bold text-white">멤버별 참석 통계</h2>
          </div>

          {stats.memberStats.length === 0 ? (
            <div className="py-8 text-center text-zinc-400">통계 데이터가 없습니다</div>
          ) : (
            <div className="space-y-3">
              {stats.memberStats.slice(0, 15).map((member: MemberAttendanceStat, index: number) => (
                <div
                  key={member.user.id}
                  className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-cyan-400 text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="truncate font-semibold text-white">
                      {member.user.nickname || member.user.full_name}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400">
                      <span>참석: {member.attended}회</span>
                      <span>신청: {member.totalSchedules}회</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-500">
                      {member.attendanceRate.toFixed(0)}%
                    </div>
                    <div className="text-xs text-zinc-500">출석률</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* 요일별 참석률 */}
        {stats.dayAttendanceRate && stats.dayAttendanceRate.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <h2 className="text-xl font-bold text-white">요일별 참석률</h2>
            </div>

            <div className="space-y-3">
              {stats.dayAttendanceRate
                .sort((a, b) => b.attendanceRate - a.attendanceRate)
                .map((item, index) => (
                  <div key={item.dayOfWeek} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-zinc-300">{item.day}요일</span>
                      <div className="flex gap-3 text-xs">
                        <span className="text-zinc-500">
                          {item.totalAttended}/{item.totalSchedules}
                        </span>
                        <span className="text-green-400">{item.attendanceRate.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.attendanceRate}%` }}
                        transition={{ duration: 0.5, delay: 0.35 + index * 0.05 }}
                        className="h-full bg-gradient-to-r from-green-500 to-green-600"
                      />
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        )}

        {/* 시간대별 참석률 */}
        {stats.timeAttendanceRate && stats.timeAttendanceRate.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.37 }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center gap-2">
              <Clock className="h-6 w-6 text-purple-500" />
              <h2 className="text-xl font-bold text-white">시간대별 참석률</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              {stats.timeAttendanceRate.map((item, index) => (
                <div
                  key={item.timeSlot}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center"
                >
                  <div className="mb-2 text-sm text-zinc-400">{item.timeSlot}</div>
                  <div className="mb-1 text-3xl font-bold text-white">
                    {item.attendanceRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-zinc-500">
                    {item.totalAttended}/{item.totalSchedules}
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.attendanceRate}%` }}
                      transition={{ duration: 0.5, delay: 0.37 + index * 0.1 }}
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 암장별 참석률 */}
        {stats.gymAttendanceRate && stats.gymAttendanceRate.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.39 }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-6 w-6 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">암장별 참석률</h2>
            </div>

            <div className="space-y-3">
              {stats.gymAttendanceRate.map((item, index) => (
                <div
                  key={item.gym.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">{item.gym.name}</div>
                      <div className="text-xs text-zinc-400">{item.gym.address}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-cyan-400">
                        {item.attendanceRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-zinc-500">
                        {item.totalAttended}/{item.totalSchedules}
                      </div>
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.attendanceRate}%` }}
                      transition={{ duration: 0.5, delay: 0.39 + index * 0.05 }}
                      className="h-full bg-gradient-to-r from-cyan-400 to-cyan-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

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

          {stats.popularGyms.length === 0 ? (
            <div className="py-8 text-center text-zinc-400">통계 데이터가 없습니다</div>
          ) : (
            <div className="space-y-3">
              {stats.popularGyms.map((gymStat: GymStat, index: number) => {
                const maxCount = Math.max(...stats.popularGyms.map((g: GymStat) => g.count));
                const percentage = maxCount > 0 ? (gymStat.count / maxCount) * 100 : 0;

                return (
                  <div
                    key={gymStat.gym.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-sm font-bold text-green-500">
                          {index + 1}
                        </div>
                        <div className="overflow-hidden">
                          <div className="truncate font-semibold text-white">
                            {gymStat.gym.name}
                          </div>
                          <div className="truncate text-xs text-zinc-400">
                            {gymStat.gym.address}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">{gymStat.count}회</div>
                        <div className="text-xs text-zinc-500">방문</div>
                      </div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: 0.4 + index * 0.05 }}
                        className="h-full bg-gradient-to-r from-green-500 to-green-600"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* 최근 활동 */}
        {stats.recentActivities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center gap-2">
              <Activity className="h-6 w-6 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">최근 활동</h2>
            </div>

            <div className="space-y-2">
              {stats.recentActivities.map((activity: (typeof stats.recentActivities)[0]) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-cyan-400" />
                    <div>
                      <div className="text-sm text-zinc-300">
                        {activity.user.nickname || activity.user.full_name}
                      </div>
                      <div className="text-xs text-zinc-500">{activity.activity_type}</div>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-500">
                    {new Date(activity.created_at!).toLocaleDateString("ko-KR", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 인사이트 */}
        {stats.attendanceRate > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`rounded-2xl border p-6 backdrop-blur-xl ${
              stats.attendanceRate >= 70
                ? "border-green-500/30 bg-green-500/5"
                : stats.attendanceRate >= 50
                  ? "border-yellow-500/30 bg-yellow-500/5"
                  : "border-red-500/30 bg-red-500/5"
            }`}
          >
            <div
              className={`mb-3 flex items-center gap-2 ${
                stats.attendanceRate >= 70
                  ? "text-green-500"
                  : stats.attendanceRate >= 50
                    ? "text-yellow-500"
                    : "text-red-500"
              }`}
            >
              {stats.attendanceRate >= 70 ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
              <h3 className="font-semibold">크루 활동 인사이트</h3>
            </div>
            <p className="text-sm text-zinc-300">
              {stats.attendanceRate >= 70
                ? `훌륭합니다! 평균 출석률이 ${stats.attendanceRate.toFixed(1)}%로 매우 활발한 크루입니다. 이 활동성을 유지하세요!`
                : stats.attendanceRate >= 50
                  ? `출석률이 ${stats.attendanceRate.toFixed(1)}%입니다. 크루원들의 참여를 높일 수 있는 이벤트를 계획해보세요.`
                  : `출석률이 ${stats.attendanceRate.toFixed(1)}%로 낮습니다. 크루원들과 소통을 강화하고 참여를 독려해주세요.`}
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
  suffix,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  suffix?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl">
      <div className={`mb-3 inline-flex rounded-lg bg-gradient-to-r p-2 text-white ${color}`}>
        {icon}
      </div>
      <div className="mb-1 text-sm text-zinc-400">{label}</div>
      <div className="text-3xl font-bold text-white">
        {value}
        {suffix && <span className="text-xl text-zinc-400">{suffix}</span>}
      </div>
    </div>
  );
}
