"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Edit,
  X as XIcon,
  Share2,
  MoreVertical,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/components/toast-provider";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { Tables } from "@/lib/supabase/database.types";

import { AttendanceSection } from "./_components/attendance-section";
import { PhaseTimeline } from "./_components/phase-timeline";
import { RsvpButton } from "./_components/rsvp-button";
import { ScheduleMap } from "./_components/schedule-map";
import {
  useScheduleDetailQuery,
  useScheduleAttendancesQuery,
} from "../_hooks/use-schedule-detail-query";

type Attendance = Pick<
  Tables<"schedule_attendances">,
  "id" | "user_id" | "status" | "checked_in_at" | "user_note" | "waitlist_position"
> & {
  user: Pick<Tables<"profiles">, "id" | "full_name" | "avatar_url" | "nickname" | "climbing_level">;
};

export default function ScheduleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const scheduleId = params.id as string;
  const toast = useToast();

  const [showMenu, setShowMenu] = useState(false);

  // React Query로 현재 사용자 정보 조회
  const { data: currentUserData } = useCurrentUser();
  const currentUserId = currentUserData?.user?.id || null;

  // React Query로 스케줄 상세 조회
  const {
    data: scheduleData,
    isLoading: isLoadingSchedule,
    error: scheduleError,
  } = useScheduleDetailQuery(scheduleId);

  // React Query로 참석자 목록 조회
  const { data: attendancesData, isLoading: isLoadingAttendances } =
    useScheduleAttendancesQuery(scheduleId);

  const schedule = scheduleData?.schedule || null;
  const attendances = (attendancesData?.attendances as unknown as Attendance[]) || [];
  const loading = isLoadingSchedule || isLoadingAttendances;

  const handleCancel = async () => {
    if (!confirm("정말 이 일정을 취소하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/schedules/${scheduleId}/cancel`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("일정 취소에 실패했습니다");
      }

      toast.success("일정이 취소되었습니다");
      router.push("/schedules");
    } catch (error) {
      console.error("Failed to cancel schedule:", error);
      toast.error("일정 취소에 실패했습니다");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: schedule?.title,
        text: schedule?.description || "",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("링크가 복사되었습니다");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-orange-500" />
          <p className="text-sm text-zinc-400">일정을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (scheduleError || !schedule) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-zinc-600" />
          <h2 className="mb-2 text-xl font-bold text-white">일정을 찾을 수 없습니다</h2>
          <p className="mb-6 text-zinc-400">
            {scheduleError instanceof Error
              ? scheduleError.message
              : "삭제되었거나 존재하지 않는 일정입니다"}
          </p>
          <button
            onClick={() => router.push("/schedules")}
            className="rounded-xl bg-orange-500 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-600"
          >
            일정 목록으로
          </button>
        </div>
      </div>
    );
  }

  const isPast = new Date(schedule.event_date) < new Date();
  const isCreator = schedule.created_by === currentUserId;
  const userAttendance = attendances.find((a) => a.user_id === currentUserId);
  const attendingCount = attendances.filter((a) => a.status === "attending").length;
  const waitlistCount = attendances.filter((a) => a.status === "waitlist").length;

  const handleEdit = () => {
    router.push(`/schedule/${scheduleId}/edit`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-4 pb-20 md:p-8">
      {/* 헤더 */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
            뒤로가기
          </button>

          <div className="flex items-center gap-2">
            {/* 공유 버튼 */}
            <button
              onClick={handleShare}
              className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-2 text-zinc-400 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
            >
              <Share2 className="h-5 w-5" />
            </button>

            {/* 관리 메뉴 (크루장만) */}
            {isCreator && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-2 text-zinc-400 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>

                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-12 right-0 z-20 w-48 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl"
                    >
                      <button
                        onClick={handleEdit}
                        className="flex w-full items-center gap-2 px-4 py-3 text-sm text-white transition-colors hover:bg-zinc-800"
                      >
                        <Edit className="h-4 w-4" />
                        일정 수정
                      </button>
                      <button
                        onClick={() => router.push(`/schedule/${scheduleId}/check-in`)}
                        className="flex w-full items-center gap-2 px-4 py-3 text-sm text-white transition-colors hover:bg-zinc-800"
                      >
                        <UserCheck className="h-4 w-4" />
                        체크인
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex w-full items-center gap-2 border-t border-zinc-800 px-4 py-3 text-sm text-red-500 transition-colors hover:bg-zinc-800"
                      >
                        <XIcon className="h-4 w-4" />
                        일정 취소
                      </button>
                    </motion.div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 상태 뱃지 */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {schedule.is_cancelled && (
            <span className="rounded-lg bg-red-500/10 px-3 py-1 text-sm font-semibold text-red-500">
              취소됨
            </span>
          )}
          {isPast && !schedule.is_cancelled && (
            <span className="rounded-lg bg-zinc-700/50 px-3 py-1 text-sm font-semibold text-zinc-400">
              완료
            </span>
          )}
          {schedule.visibility === "public" && (
            <span className="rounded-lg bg-cyan-400/10 px-3 py-1 text-sm font-semibold text-cyan-400">
              공개
            </span>
          )}
        </div>

        {/* 제목 & 크루 */}
        <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">{schedule.title}</h1>
        <p className="text-lg text-orange-500">{schedule.crew?.name || "Unknown Crew"}</p>
      </motion.div>

      <div className="mx-auto max-w-5xl space-y-6">
        {/* 기본 정보 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
        >
          {schedule.description && <p className="mb-6 text-zinc-300">{schedule.description}</p>}

          <div className="grid gap-4 md:grid-cols-2">
            {/* 날짜 */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-orange-500/10 p-2">
                <Calendar className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <div className="text-sm text-zinc-400">날짜</div>
                <div className="font-semibold text-white">
                  {new Date(schedule.event_date).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    weekday: "long",
                  })}
                </div>
              </div>
            </div>

            {/* 시간 */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-cyan-400/10 p-2">
                <Clock className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <div className="text-sm text-zinc-400">시간</div>
                <div className="font-semibold text-white">
                  {schedule.phases[0]?.start_time || "미정"}
                  {schedule.phases[0]?.end_time && ` - ${schedule.phases[0].end_time}`}
                </div>
              </div>
            </div>

            {/* 정원 */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-purple-500/10 p-2">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <div className="text-sm text-zinc-400">정원</div>
                <div className="font-semibold text-white">
                  {attendingCount} / {schedule.total_capacity || 0}명
                  {waitlistCount > 0 && (
                    <span className="ml-2 text-sm text-yellow-500">(대기 {waitlistCount})</span>
                  )}
                </div>
              </div>
            </div>

            {/* 장소 */}
            {schedule.phases[0]?.gym && (
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-green-500/10 p-2">
                  <MapPin className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <div className="text-sm text-zinc-400">장소</div>
                  <div className="font-semibold text-white">{schedule.phases[0].gym.name}</div>
                  {schedule.phases[0].gym.address && (
                    <div className="text-sm text-zinc-500">{schedule.phases[0].gym.address}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 태그 */}
          {schedule.tags && schedule.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2 border-t border-zinc-800 pt-6">
              {schedule.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-zinc-800/50 px-3 py-1 text-sm font-medium text-zinc-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* 단계별 일정 (1차/2차) */}
        {schedule.phases.length > 0 && (
          <PhaseTimeline
            phases={schedule.phases.map((phase) => ({
              id: phase.id,
              phase_number: phase.phase_number,
              title: phase.title,
              start_time: phase.start_time,
              end_time: phase.end_time,
              capacity: null,
              created_at: null,
              gym_id: phase.gym?.id || null,
              location_text: phase.gym?.name || null,
              notes: null,
              schedule_id: scheduleId,
              updated_at: null,
              gym: phase.gym
                ? {
                    id: phase.gym.id,
                    name: phase.gym.name,
                    address: phase.gym.address,
                  }
                : null,
            }))}
          />
        )}

        {/* 지도 */}
        {schedule.phases[0]?.gym && schedule.phases[0].gym.address && (
          <ScheduleMap
            gym={{
              id: schedule.phases[0].gym.id,
              name: schedule.phases[0].gym.name,
              address: schedule.phases[0].gym.address || "",
            }}
          />
        )}

        {/* 참석자 목록 */}
        <AttendanceSection
          scheduleId={scheduleId}
          attendances={attendances}
          totalCapacity={schedule.total_capacity || 0}
          isCreator={isCreator}
        />
      </div>

      {/* 하단 고정 RSVP 버튼 */}
      {!isPast && !schedule.is_cancelled && (
        <RsvpButton
          scheduleId={scheduleId}
          userAttendance={userAttendance}
          isFull={attendingCount >= (schedule.total_capacity || 0)}
          allowWaitlist={schedule.allow_waitlist || false}
        />
      )}
    </div>
  );
}
