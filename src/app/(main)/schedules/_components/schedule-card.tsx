"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronRight,
  CheckCircle,
  XCircle,
  HelpCircle,
  UserCheck,
} from "lucide-react";
import Link from "next/link";

import type { ScheduleWithRelations } from "@/lib/api/schedule-helpers";

type Schedule = ScheduleWithRelations & {
  stats?: {
    attending_count: number;
    waitlist_count: number;
    checked_in_count: number;
  };
};

type ScheduleCardProps = {
  schedule: Schedule;
  index?: number;
};

export function ScheduleCard({ schedule, index = 0 }: ScheduleCardProps) {
  const isPast = new Date(schedule.event_date) < new Date();
  const firstPhase = schedule.phases[0];
  const hasMultiplePhases = schedule.phases.length > 1;

  // 참석 상태 뱃지
  const getAttendanceBadge = () => {
    // TODO: 현재 사용자의 참석 상태를 확인
    // 지금은 임시로 attending으로 설정
    const userStatus = "attending";

    if (userStatus === "attending") {
      return (
        <div className="flex items-center gap-1 rounded-lg bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500">
          <CheckCircle className="h-3 w-3" />
          참석
        </div>
      );
    } else if (userStatus === "not_attending") {
      return (
        <div className="flex items-center gap-1 rounded-lg bg-red-500/10 px-2 py-1 text-xs font-medium text-red-500">
          <XCircle className="h-3 w-3" />
          불참
        </div>
      );
    } else if (userStatus === "maybe") {
      return (
        <div className="flex items-center gap-1 rounded-lg bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-500">
          <HelpCircle className="h-3 w-3" />
          미정
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <Link href={`/schedules/${schedule.id}`}>
        <div
          className={`group relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all hover:border-orange-500/50 ${
            isPast
              ? "border-zinc-800 bg-zinc-900/30"
              : "border-zinc-800 bg-zinc-900/50 hover:shadow-lg hover:shadow-orange-500/10"
          }`}
        >
          {/* 상태 표시 (취소/완료) */}
          {schedule.is_cancelled && (
            <div className="absolute top-4 right-4 z-10 rounded-lg bg-red-500/90 px-3 py-1 text-xs font-bold text-white">
              취소됨
            </div>
          )}
          {isPast && !schedule.is_cancelled && (
            <div className="absolute top-4 right-4 z-10 rounded-lg bg-zinc-700/90 px-3 py-1 text-xs font-bold text-white">
              완료
            </div>
          )}

          <div className="p-6">
            {/* 상단: 크루 & 날짜 */}
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs font-medium text-orange-500">
                    {schedule.crew?.name || "Unknown Crew"}
                  </span>
                  {getAttendanceBadge()}
                </div>
                <h3 className={`text-xl font-bold ${isPast ? "text-zinc-400" : "text-white"}`}>
                  {schedule.title}
                </h3>
              </div>
              <ChevronRight
                className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${
                  isPast ? "text-zinc-600" : "text-zinc-400"
                }`}
              />
            </div>

            {/* 설명 */}
            {schedule.description && (
              <p className="mb-4 line-clamp-2 text-sm text-zinc-400">{schedule.description}</p>
            )}

            {/* 정보 그리드 */}
            <div className="space-y-2">
              {/* 날짜 */}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className={`h-4 w-4 ${isPast ? "text-zinc-600" : "text-zinc-400"}`} />
                <span className={isPast ? "text-zinc-500" : "text-zinc-300"}>
                  {new Date(schedule.event_date).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    weekday: "short",
                  })}
                </span>
              </div>

              {/* 시간 */}
              <div className="flex items-center gap-2 text-sm">
                <Clock className={`h-4 w-4 ${isPast ? "text-zinc-600" : "text-zinc-400"}`} />
                <span className={isPast ? "text-zinc-500" : "text-zinc-300"}>
                  {firstPhase.start_time}
                  {firstPhase.end_time && ` - ${firstPhase.end_time}`}
                  {hasMultiplePhases && (
                    <span className="ml-1 text-xs text-orange-500">
                      +{schedule.phases.length - 1}차
                    </span>
                  )}
                </span>
              </div>

              {/* 장소 */}
              {firstPhase.gym && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className={`h-4 w-4 ${isPast ? "text-zinc-600" : "text-zinc-400"}`} />
                  <span className={`line-clamp-1 ${isPast ? "text-zinc-500" : "text-zinc-300"}`}>
                    {firstPhase.gym.name}
                  </span>
                </div>
              )}

              {/* 정원 & 참석 현황 */}
              {schedule.stats && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className={`h-4 w-4 ${isPast ? "text-zinc-600" : "text-zinc-400"}`} />
                  <div className="flex items-center gap-2">
                    <span className={isPast ? "text-zinc-500" : "text-zinc-300"}>
                      {schedule.stats.attending_count} / {schedule.total_capacity || 0}명
                    </span>
                    {schedule.stats.waitlist_count > 0 && (
                      <span className="text-xs text-yellow-500">
                        (대기 {schedule.stats.waitlist_count})
                      </span>
                    )}
                    {schedule.stats.checked_in_count > 0 && isPast && (
                      <span className="text-xs text-green-500">
                        <UserCheck className="mr-1 inline h-3 w-3" />
                        {schedule.stats.checked_in_count}명 참석
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 태그 */}
            {schedule.tags && schedule.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {schedule.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`rounded-lg px-2 py-1 text-xs font-medium ${
                      isPast ? "bg-zinc-800/50 text-zinc-500" : "bg-zinc-800/50 text-zinc-400"
                    }`}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 하단 진행 바 (정원 시각화) */}
          {schedule.stats && !isPast && (
            <div className="h-1 bg-zinc-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${(schedule.stats.attending_count / (schedule.total_capacity || 1)) * 100}%`,
                }}
                transition={{ delay: 0.2 + index * 0.05, duration: 0.5 }}
                className="h-full bg-gradient-to-r from-orange-500 to-cyan-400"
              />
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
