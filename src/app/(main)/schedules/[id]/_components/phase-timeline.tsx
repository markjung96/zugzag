"use client";

import { motion } from "framer-motion";
import { Clock, MapPin, Users, FileText, CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { useState } from "react";

import { useToast } from "@/components/toast-provider";
import type { Tables } from "@/lib/supabase/database.types";

type Phase = Pick<
  Tables<"schedule_phases">,
  | "id"
  | "phase_number"
  | "title"
  | "start_time"
  | "end_time"
  | "phase_type"
  | "location_text"
  | "location_kakao_id"
  | "location_kakao_name"
  | "location_kakao_address"
  | "location_kakao_category"
  | "capacity"
  | "notes"
  | "gym_id"
> & {
  gym: Pick<Tables<"gyms">, "id" | "name" | "address"> | null;
};

type PhaseAttendance = Pick<Tables<"schedule_attendances">, "id" | "phase_id" | "status">;

type Attendance = Pick<
  Tables<"schedule_attendances">,
  "id" | "user_id" | "phase_id" | "status" | "checked_in_at"
>;

type PhaseTimelineProps = {
  phases: Phase[];
  scheduleId: string;
  userPhaseAttendances?: PhaseAttendance[];
  allAttendances?: Attendance[];
  isRsvpClosed?: boolean;
};

export function PhaseTimeline({
  phases,
  scheduleId,
  userPhaseAttendances = [],
  allAttendances = [],
  isRsvpClosed = false,
}: PhaseTimelineProps) {
  const toast = useToast();
  const [loadingPhaseId, setLoadingPhaseId] = useState<string | null>(null);

  const getPhaseAttendance = (phaseId: string) => {
    return userPhaseAttendances.find((a) => a.phase_id === phaseId);
  };

  const getPhaseAttendingCount = (phaseId: string) => {
    return allAttendances.filter((a) => a.phase_id === phaseId && a.status === "attending").length;
  };

  const handlePhaseRsvp = async (
    phaseId: string,
    status: "attending" | "not_attending" | "maybe",
  ) => {
    if (isRsvpClosed) {
      toast.error("RSVP 마감 시간이 지났습니다");
      return;
    }

    setLoadingPhaseId(phaseId);

    try {
      const response = await fetch(`/api/schedules/${scheduleId}/rsvp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phase_id: phaseId,
          status,
        }),
      });

      if (!response.ok) {
        throw new Error("RSVP 등록에 실패했습니다");
      }

      const statusLabel = status === "attending" ? "참석" : status === "maybe" ? "미정" : "불참";
      toast.success(`"${statusLabel}"(으)로 변경되었습니다`);

      // 페이지 새로고침
      window.location.reload();
    } catch (error) {
      console.error("Failed to RSVP:", error);
      toast.error("참석 등록에 실패했습니다");
    } finally {
      setLoadingPhaseId(null);
    }
  };

  const getButtonStyle = (phaseId: string, buttonStatus: string) => {
    const phaseAttendance = getPhaseAttendance(phaseId);
    if (phaseAttendance?.status === buttonStatus) {
      switch (buttonStatus) {
        case "attending":
          return "bg-green-500 text-white";
        case "not_attending":
          return "bg-red-500 text-white";
        case "maybe":
          return "bg-yellow-500 text-white";
      }
    }
    return "bg-zinc-800 text-zinc-300 hover:bg-zinc-700";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
    >
      <h2 className="mb-6 text-xl font-bold text-white">
        단계별 일정{" "}
        <span className="text-sm font-normal text-zinc-400">(각 단계별로 참석 선택 가능)</span>
      </h2>

      <div className="space-y-6">
        {phases.map((phase, index) => {
          const phaseAttendance = getPhaseAttendance(phase.id);
          const isLoading = loadingPhaseId === phase.id;

          return (
            <div key={phase.id} className="relative">
              {/* 타임라인 연결선 */}
              {index < phases.length - 1 && (
                <div className="absolute top-12 left-6 h-full w-0.5 bg-gradient-to-b from-orange-500 to-cyan-400" />
              )}

              <div className="flex gap-4">
                {/* 단계 번호 */}
                <div className="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-cyan-400 font-bold text-white">
                  {phase.phase_number}
                </div>

                {/* 단계 정보 */}
                <div className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                  <h3 className="mb-3 text-lg font-semibold text-white">{phase.title}</h3>

                  <div className="space-y-2">
                    {/* 시간 */}
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-zinc-400" />
                      <span className="text-zinc-300">
                        {phase.start_time}
                        {phase.end_time && ` - ${phase.end_time}`}
                      </span>
                    </div>

                    {/* 장소 - phase_type에 따라 다르게 표시 */}
                    {phase.phase_type === "exercise" && phase.gym && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-zinc-400" />
                        <div>
                          <div className="text-zinc-300">{phase.gym.name}</div>
                          {phase.gym.address && (
                            <div className="text-xs text-zinc-500">{phase.gym.address}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {(phase.phase_type === "meal" || phase.phase_type === "afterparty") &&
                      phase.location_kakao_name && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-zinc-400" />
                          <div>
                            <div className="text-zinc-300">{phase.location_kakao_name}</div>
                            {phase.location_kakao_address && (
                              <div className="text-xs text-zinc-500">
                                {phase.location_kakao_address}
                              </div>
                            )}
                            {phase.location_kakao_category && (
                              <div className="text-xs text-zinc-600">
                                {phase.location_kakao_category}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                    {phase.location_text && !phase.gym && !phase.location_kakao_name && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-zinc-400" />
                        <span className="text-zinc-300">{phase.location_text}</span>
                      </div>
                    )}

                    {/* 정원 */}
                    {phase.capacity && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-zinc-400" />
                        <span className="text-zinc-300">
                          {getPhaseAttendingCount(phase.id)} / {phase.capacity}명
                        </span>
                      </div>
                    )}

                    {/* 메모 */}
                    {phase.notes && (
                      <div className="flex items-start gap-2 text-sm">
                        <FileText className="mt-0.5 h-4 w-4 text-zinc-400" />
                        <span className="text-zinc-400">{phase.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* 단계별 RSVP 버튼 */}
                  <div className="mt-4 border-t border-zinc-800 pt-4">
                    {phaseAttendance && (
                      <div className="mb-2 text-xs text-zinc-400">
                        현재 상태:{" "}
                        <span className="font-semibold text-white">
                          {phaseAttendance.status === "attending"
                            ? "참석"
                            : phaseAttendance.status === "maybe"
                              ? "미정"
                              : "불참"}
                        </span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePhaseRsvp(phase.id, "attending")}
                        disabled={isLoading || isRsvpClosed}
                        className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-all disabled:opacity-50 ${getButtonStyle(phase.id, "attending")}`}
                      >
                        <CheckCircle className="h-4 w-4" />
                        참석
                      </button>
                      <button
                        onClick={() => handlePhaseRsvp(phase.id, "maybe")}
                        disabled={isLoading || isRsvpClosed}
                        className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-all disabled:opacity-50 ${getButtonStyle(phase.id, "maybe")}`}
                      >
                        <HelpCircle className="h-4 w-4" />
                        미정
                      </button>
                      <button
                        onClick={() => handlePhaseRsvp(phase.id, "not_attending")}
                        disabled={isLoading || isRsvpClosed}
                        className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-all disabled:opacity-50 ${getButtonStyle(phase.id, "not_attending")}`}
                      >
                        <XCircle className="h-4 w-4" />
                        불참
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
