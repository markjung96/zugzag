"use client";

import { motion } from "framer-motion";
import { Users, CheckCircle, XCircle, HelpCircle, Clock, Ban } from "lucide-react";

import type { MockAttendance } from "@/lib/mock";

type AttendanceSectionProps = {
  eventId: string;
  attendances: MockAttendance[];
  totalCapacity: number;
  isCreator: boolean;
};

export function AttendanceSection({
  attendances,
  totalCapacity,
  isCreator,
}: AttendanceSectionProps) {
  // 상태별로 그룹화
  const attending = attendances.filter((a) => a.status === "attending");
  const waitlist = attendances.filter((a) => a.status === "waitlist");
  const maybe = attendances.filter((a) => a.status === "maybe");
  const notAttending = attendances.filter((a) => a.status === "not_attending");

  const getStatusIcon = (status: MockAttendance["status"]) => {
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

  const getStatusText = (status: MockAttendance["status"]) => {
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

  const renderAttendanceList = (list: MockAttendance[], title: string, color: string) => {
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
                  {attendance.user.nickname?.[0] || attendance.user.full_name[0]}
                </div>

                {/* 사용자 정보 */}
                <div>
                  <div className="font-medium text-white">
                    {attendance.user.nickname || attendance.user.full_name}
                  </div>
                  {attendance.user.climbing_level && (
                    <div className="text-xs text-zinc-500">{attendance.user.climbing_level}</div>
                  )}
                  {attendance.user_note && (
                    <div className="mt-1 text-xs text-zinc-400">{attendance.user_note}</div>
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
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold text-white">
          <Users className="h-6 w-6 text-orange-500" />
          참석자
        </h2>
        <div className="text-sm text-zinc-400">
          {attending.length} / {totalCapacity}명
        </div>
      </div>

      {/* 정원 진행 바 */}
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-xs text-zinc-400">
          <span>정원</span>
          <span>
            {Math.round((attending.length / totalCapacity) * 100)}% ({attending.length}/
            {totalCapacity})
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(attending.length / totalCapacity) * 100}%` }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="h-full bg-gradient-to-r from-orange-500 to-cyan-400"
          />
        </div>
      </div>

      {/* 참석자 목록 */}
      {renderAttendanceList(attending, "참석", "bg-green-500/10 text-green-500")}

      {/* 대기자 목록 */}
      {renderAttendanceList(waitlist, "대기", "bg-orange-500/10 text-orange-500")}

      {/* 미정 목록 */}
      {renderAttendanceList(maybe, "미정", "bg-yellow-500/10 text-yellow-500")}

      {/* 불참 목록 (크루장만 보임) */}
      {isCreator && renderAttendanceList(notAttending, "불참", "bg-red-500/10 text-red-500")}

      {/* 참석자 없음 */}
      {attendances.length === 0 && (
        <div className="py-12 text-center">
          <Users className="mx-auto mb-3 h-12 w-12 text-zinc-700" />
          <p className="text-sm text-zinc-500">아직 참석자가 없습니다</p>
        </div>
      )}
    </motion.div>
  );
}

