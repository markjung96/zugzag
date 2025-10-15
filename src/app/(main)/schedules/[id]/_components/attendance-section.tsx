"use client";

import { motion } from "framer-motion";
import { Users, CheckCircle, XCircle, HelpCircle, Clock, Ban } from "lucide-react";

import type { Tables } from "@/lib/supabase/database.types";

type Attendance = Pick<
  Tables<"schedule_attendances">,
  "id" | "user_id" | "phase_id" | "status" | "checked_in_at" | "user_note" | "waitlist_position"
> & {
  user: Pick<Tables<"profiles">, "id" | "full_name" | "avatar_url" | "nickname" | "climbing_level">;
};

type Phase = {
  id: string;
  phase_number: number;
  title: string;
};

type AttendanceSectionProps = {
  scheduleId: string;
  attendances: Attendance[];
  phases: Phase[];
  isCreator: boolean;
};

export function AttendanceSection({ attendances, phases, isCreator }: AttendanceSectionProps) {
  // 단계별로 그룹화
  const getPhaseAttendances = (phaseId: string) => {
    return attendances.filter((a) => a.phase_id === phaseId);
  };

  const getPhaseStats = (phaseId: string) => {
    const phaseAttendances = getPhaseAttendances(phaseId);
    return {
      attending: phaseAttendances.filter((a) => a.status === "attending"),
      waitlist: phaseAttendances.filter((a) => a.status === "waitlist"),
      maybe: phaseAttendances.filter((a) => a.status === "maybe"),
      notAttending: phaseAttendances.filter((a) => a.status === "not_attending"),
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "attending":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "not_attending":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "maybe":
        return <HelpCircle className="h-4 w-4 text-yellow-500" />;
      case "waitlist":
        return <Clock className="h-4 w-4 text-orange-500" />;
      case "no_show":
        return <Ban className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const _getStatusText = (status: string) => {
    switch (status) {
      case "attending":
        return "참석";
      case "not_attending":
        return "불참";
      case "maybe":
        return "미정";
      case "waitlist":
        return "대기";
      case "no_show":
        return "노쇼";
      default:
        return status;
    }
  };

  const renderAttendanceList = (list: Attendance[], title: string, color: string) => {
    if (list.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-400">
          {title}
          <span className={`rounded-full px-2 py-0.5 text-xs ${color}`}>{list.length}</span>
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((attendance) => (
            <motion.div
              key={attendance.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-3"
            >
              <div className="flex items-center gap-3">
                {/* 아바타 */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-cyan-400 font-semibold text-white">
                  {attendance.user.nickname?.[0] || attendance.user.full_name?.[0] || "?"}
                </div>

                {/* 사용자 정보 */}
                <div>
                  <div className="font-medium text-white">
                    {attendance.user.full_name ||
                      attendance.user.nickname ||
                      `사용자#${attendance.user.id.slice(0, 8)}`}
                  </div>
                  {attendance.user.climbing_level && (
                    <div className="text-xs text-zinc-500">{attendance.user.climbing_level}</div>
                  )}
                  {attendance.user_note && (
                    <div className="mt-1 text-xs text-zinc-400">{attendance.user_note}</div>
                  )}
                  {!attendance.user.full_name && !attendance.user.nickname && (
                    <div className="mt-1 text-xs text-zinc-500">프로필을 완성해주세요</div>
                  )}
                </div>
              </div>

              {/* 상태 뱃지 */}
              <div className="flex items-center gap-1 text-xs font-medium text-zinc-400">
                {getStatusIcon(attendance.status)}
                {attendance.waitlist_position && (
                  <span className="text-orange-500">#{attendance.waitlist_position}</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
    >
      <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
        <Users className="h-6 w-6 text-orange-500" />
        참석자 목록
      </h2>

      {/* 참석자 없음 */}
      {attendances.length === 0 && (
        <div className="py-12 text-center">
          <Users className="mx-auto mb-3 h-12 w-12 text-zinc-700" />
          <p className="text-sm text-zinc-500">아직 참석자가 없습니다</p>
        </div>
      )}

      {/* 단계별 참석자 목록 */}
      {phases.map((phase, idx) => {
        const stats = getPhaseStats(phase.id);
        const totalAttending = stats.attending.length;

        return (
          <div key={phase.id} className={idx > 0 ? "mt-8" : ""}>
            <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-semibold text-white">{phase.title}</h3>
              <div className="text-sm text-zinc-400">{totalAttending}명 참석</div>
            </div>

            {/* 참석자 목록 */}
            {renderAttendanceList(stats.attending, "참석", "bg-green-500/10 text-green-500")}

            {/* 대기자 목록 */}
            {renderAttendanceList(stats.waitlist, "대기", "bg-orange-500/10 text-orange-500")}

            {/* 미정 목록 */}
            {renderAttendanceList(stats.maybe, "미정", "bg-yellow-500/10 text-yellow-500")}

            {/* 불참 목록 (크루장만 보임) */}
            {isCreator &&
              renderAttendanceList(stats.notAttending, "불참", "bg-red-500/10 text-red-500")}

            {/* 해당 단계 참석자 없음 */}
            {totalAttending === 0 &&
              stats.waitlist.length === 0 &&
              stats.maybe.length === 0 &&
              stats.notAttending.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-sm text-zinc-500">이 단계의 참석자가 없습니다</p>
                </div>
              )}
          </div>
        );
      })}
    </motion.div>
  );
}
