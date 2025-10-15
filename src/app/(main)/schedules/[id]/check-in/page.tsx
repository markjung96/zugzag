"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  UserCheck,
  UserX,
  Users,
  CheckCircle,
  XCircle,
  HelpCircle,
  Clock,
  Ban,
  ArrowUp,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";

import { Dropdown } from "@/components/dropdown";
import { useToast } from "@/components/toast-provider";

import {
  useCheckInAttendancesQuery,
  useCheckInMutation,
  type CheckInAttendance,
  type CheckInActionData,
} from "./_hooks";
import { useScheduleDetailQuery } from "../../_hooks/use-schedule-detail-query";

export default function CheckInPage() {
  const router = useRouter();
  const params = useParams();
  const scheduleId = params.id as string;
  const toast = useToast();

  const [adminNote, setAdminNote] = useState("");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<CheckInActionData | null>(null);

  // React Query로 일정 상세 및 참석자 목록 조회
  const { data: scheduleData, isLoading: isLoadingSchedule } = useScheduleDetailQuery(scheduleId);
  const { data: attendancesData, isLoading: isLoadingAttendances } =
    useCheckInAttendancesQuery(scheduleId);
  const checkInMutation = useCheckInMutation(scheduleId);

  const schedule = scheduleData?.schedule;
  const attendances = attendancesData?.attendances || [];

  const loading = isLoadingSchedule || isLoadingAttendances;

  // 상태별 그룹화
  const attending = attendances.filter((a) => a.status === "attending");
  const checkedIn = attendances.filter((a) => a.checked_in_at !== null);
  const waitlist = attendances.filter((a) => a.status === "waitlist");
  const maybe = attendances.filter((a) => a.status === "maybe");
  const notAttending = attendances.filter((a) => a.status === "not_attending");
  const noShow = attendances.filter((a) => a.status === "no_show");
  const late = attendances.filter((a) => a.status === "late");
  const earlyLeave = attendances.filter((a) => a.status === "early_leave");

  const handleAction = (action: CheckInActionData) => {
    // 메모가 필요한 액션인지 확인
    if (
      action.action === "check_in" ||
      action.action === "check_out" ||
      action.action === "update_status"
    ) {
      setPendingAction(action);
      setShowNoteModal(true);
    } else {
      executeAction(action);
    }
  };

  const executeAction = async (action: CheckInActionData) => {
    try {
      const result = await checkInMutation.mutateAsync(action);

      const actionText =
        action.action === "check_in"
          ? "체크인"
          : action.action === "check_out"
            ? "체크아웃"
            : action.action === "promote"
              ? "승격"
              : action.action === "auto_mark_noshow"
                ? "자동 노쇼 처리"
                : "상태 변경";

      if (action.action === "auto_mark_noshow" && result.updated_count !== undefined) {
        toast.success(`${result.updated_count}명을 노쇼 처리했습니다`);
      } else {
        toast.success(`${actionText} 완료`);
      }

      setShowNoteModal(false);
      setAdminNote("");
      setPendingAction(null);
    } catch (error) {
      console.error("Failed to perform action:", error);
      toast.error(error instanceof Error ? error.message : "작업 실패");
    }
  };

  const handleConfirmNote = () => {
    if (pendingAction) {
      const actionWithNote = {
        ...pendingAction,
        admin_note: adminNote || undefined,
      } as CheckInActionData;
      executeAction(actionWithNote);
    }
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
      case "late":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "early_leave":
        return <ArrowUp className="h-4 w-4 rotate-180 text-orange-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
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
      case "late":
        return "지각";
      case "early_leave":
        return "조기퇴장";
      default:
        return status;
    }
  };

  const renderAttendanceCard = (attendance: CheckInAttendance) => {
    const isCheckedIn = attendance.checked_in_at !== null;
    const isCheckedOut = attendance.checked_out_at !== null;

    return (
      <motion.div
        key={attendance.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
      >
        <div className="flex items-start justify-between">
          {/* 사용자 정보 */}
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-cyan-400 font-semibold text-white">
              {attendance.user.nickname?.[0] || attendance.user.full_name?.[0] || "?"}
            </div>
            <div className="flex-1">
              <div className="font-medium text-white">
                {attendance.user.nickname || attendance.user.full_name}
              </div>
              {attendance.user.climbing_level && (
                <div className="text-xs text-zinc-500">{attendance.user.climbing_level}</div>
              )}
              <div className="mt-1 flex items-center gap-2">
                {getStatusIcon(attendance.status)}
                <span className="text-xs text-zinc-400">{getStatusText(attendance.status)}</span>
                {attendance.waitlist_position && (
                  <span className="text-xs text-orange-500">#{attendance.waitlist_position}</span>
                )}
              </div>
              {isCheckedIn && (
                <div className="mt-1 text-xs text-green-500">
                  ✓ 체크인: {new Date(attendance.checked_in_at!).toLocaleTimeString("ko-KR")}
                </div>
              )}
              {isCheckedOut && (
                <div className="mt-1 text-xs text-cyan-500">
                  ✓ 체크아웃: {new Date(attendance.checked_out_at!).toLocaleTimeString("ko-KR")}
                </div>
              )}
              {attendance.user_note && (
                <div className="mt-2 rounded-lg bg-zinc-800/50 p-2 text-xs text-zinc-400">
                  💬 {attendance.user_note}
                </div>
              )}
              {attendance.admin_note && (
                <div className="mt-2 rounded-lg bg-orange-500/10 p-2 text-xs text-orange-400">
                  📝 관리자: {attendance.admin_note}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="mt-4 flex flex-wrap gap-2">
          {/* 체크인/아웃 버튼 */}
          {attendance.status === "attending" && !isCheckedIn && (
            <button
              onClick={() =>
                handleAction({
                  action: "check_in",
                  attendance_id: attendance.id,
                })
              }
              disabled={checkInMutation.isPending}
              className="flex items-center gap-1 rounded-lg bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-500 transition-colors hover:bg-green-500/20 disabled:opacity-50"
            >
              <UserCheck className="h-3 w-3" />
              체크인
            </button>
          )}

          {isCheckedIn && !isCheckedOut && (
            <button
              onClick={() =>
                handleAction({
                  action: "check_out",
                  attendance_id: attendance.id,
                })
              }
              disabled={checkInMutation.isPending}
              className="flex items-center gap-1 rounded-lg bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-500 transition-colors hover:bg-cyan-500/20 disabled:opacity-50"
            >
              <UserX className="h-3 w-3" />
              체크아웃
            </button>
          )}

          {/* 대기자 승격 */}
          {attendance.status === "waitlist" && (
            <button
              onClick={() =>
                handleAction({
                  action: "promote",
                  attendance_id: attendance.id,
                })
              }
              disabled={checkInMutation.isPending}
              className="flex items-center gap-1 rounded-lg bg-orange-500/10 px-3 py-1.5 text-xs font-medium text-orange-500 transition-colors hover:bg-orange-500/20 disabled:opacity-50"
            >
              <TrendingUp className="h-3 w-3" />
              승격
            </button>
          )}

          {/* 상태 변경 드롭다운 */}
          <div className="min-w-[100px]">
            <Dropdown
              options={[
                { value: "attending", label: "참석" },
                { value: "not_attending", label: "불참" },
                { value: "maybe", label: "미정" },
                { value: "waitlist", label: "대기" },
                { value: "late", label: "지각" },
                { value: "early_leave", label: "조기퇴장" },
                { value: "no_show", label: "노쇼" },
              ]}
              value={attendance.status}
              onChange={(value) => {
                const newStatus = value as
                  | "attending"
                  | "not_attending"
                  | "maybe"
                  | "waitlist"
                  | "late"
                  | "early_leave"
                  | "no_show";
                handleAction({
                  action: "update_status",
                  attendance_id: attendance.id,
                  status: newStatus,
                });
              }}
              disabled={checkInMutation.isPending}
            />
          </div>
        </div>
      </motion.div>
    );
  };

  const renderSection = (
    title: string,
    list: CheckInAttendance[],
    color: string,
    icon: React.ReactNode,
  ) => {
    if (list.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-300">
          {icon}
          {title}
          <span className={`rounded-full px-2 py-0.5 text-xs ${color}`}>{list.length}</span>
        </h3>
        <div className="space-y-3">
          {list.map((attendance) => renderAttendanceCard(attendance))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-orange-500" />
          <p className="text-sm text-zinc-400">체크인 정보 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-zinc-600" />
          <h2 className="mb-2 text-xl font-bold text-white">일정을 찾을 수 없습니다</h2>
          <button
            onClick={() => router.back()}
            className="mt-4 rounded-xl bg-orange-500 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-600"
          >
            뒤로가기
          </button>
        </div>
      </div>
    );
  }

  const checkInRate = attending.length > 0 ? (checkedIn.length / attending.length) * 100 : 0;

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
        <h1 className="mb-2 text-3xl font-bold text-white">출석 체크</h1>
        <p className="text-lg text-zinc-400">{schedule.title}</p>
      </motion.div>

      <div className="mx-auto max-w-5xl space-y-6">
        {/* 통계 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 md:grid-cols-4"
        >
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-zinc-400">
              <Users className="h-4 w-4" />
              참석 예정
            </div>
            <div className="text-2xl font-bold text-white">
              {attending.length} / {schedule.total_capacity}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-zinc-400">
              <UserCheck className="h-4 w-4" />
              체크인 완료
            </div>
            <div className="text-2xl font-bold text-green-500">{checkedIn.length}</div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-zinc-400">
              <Clock className="h-4 w-4" />
              대기 중
            </div>
            <div className="text-2xl font-bold text-orange-500">{waitlist.length}</div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-zinc-400">
              <TrendingUp className="h-4 w-4" />
              체크인율
            </div>
            <div className="text-2xl font-bold text-cyan-400">{checkInRate.toFixed(0)}%</div>
          </div>
        </motion.div>

        {/* 자동 노쇼 처리 버튼 */}
        {attending.length > checkedIn.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <button
              onClick={() => {
                if (
                  window.confirm(
                    `체크인하지 않은 ${attending.length - checkedIn.length}명을 노쇼로 처리하시겠습니까?\n\n이 작업은 일정 종료 후에만 실행됩니다.`,
                  )
                ) {
                  handleAction({ action: "auto_mark_noshow" });
                }
              }}
              disabled={checkInMutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-800 bg-red-900/20 px-4 py-3 font-medium text-red-400 transition-all hover:border-red-700 hover:bg-red-900/30 disabled:opacity-50"
            >
              <Ban className="h-5 w-5" />
              일정 종료 후 자동 노쇼 처리 (체크인 안한 참석자)
            </button>
          </motion.div>
        )}

        {/* 참석자 목록 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
        >
          {renderSection(
            "참석 예정",
            attending,
            "bg-green-500/10 text-green-500",
            <CheckCircle className="h-4 w-4" />,
          )}
          {renderSection(
            "대기 중",
            waitlist,
            "bg-orange-500/10 text-orange-500",
            <Clock className="h-4 w-4" />,
          )}
          {renderSection(
            "지각",
            late,
            "bg-yellow-500/10 text-yellow-500",
            <Clock className="h-4 w-4" />,
          )}
          {renderSection(
            "조기퇴장",
            earlyLeave,
            "bg-orange-500/10 text-orange-500",
            <ArrowUp className="h-4 w-4 rotate-180" />,
          )}
          {renderSection("노쇼", noShow, "bg-red-500/10 text-red-500", <Ban className="h-4 w-4" />)}
          {renderSection(
            "미정",
            maybe,
            "bg-yellow-500/10 text-yellow-500",
            <HelpCircle className="h-4 w-4" />,
          )}
          {renderSection(
            "불참",
            notAttending,
            "bg-red-500/10 text-red-500",
            <XCircle className="h-4 w-4" />,
          )}

          {attendances.length === 0 && (
            <div className="py-12 text-center">
              <Users className="mx-auto mb-3 h-12 w-12 text-zinc-700" />
              <p className="text-sm text-zinc-500">아직 참석자가 없습니다</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* 관리자 메모 모달 */}
      {showNoteModal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowNoteModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-md -translate-y-1/2 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl"
          >
            <h3 className="mb-4 text-xl font-bold text-white">관리자 메모 (선택)</h3>

            <div className="mb-6">
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="메모를 입력하세요..."
                rows={3}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-500 transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowNoteModal(false);
                  setAdminNote("");
                  setPendingAction(null);
                }}
                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 font-medium text-white transition-all hover:bg-zinc-800"
              >
                취소
              </button>
              <button
                onClick={handleConfirmNote}
                disabled={checkInMutation.isPending}
                className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-3 font-medium text-white transition-all hover:from-orange-600 hover:to-orange-700 disabled:opacity-50"
              >
                {checkInMutation.isPending ? "처리 중..." : "확인"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
