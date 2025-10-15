"use client";

import { motion } from "framer-motion";
import { CheckCircle, XCircle, HelpCircle, Clock } from "lucide-react";
import { useState } from "react";

import { useToast } from "@/components/toast-provider";
import type { Tables } from "@/lib/supabase/database.types";

type UserAttendance = Pick<
  Tables<"schedule_attendances">,
  "id" | "user_id" | "status" | "checked_in_at" | "user_note" | "waitlist_position"
>;

type RsvpButtonProps = {
  scheduleId: string;
  userAttendance?: UserAttendance;
  isFull: boolean;
  allowWaitlist: boolean;
  rsvpDeadline?: string | null;
};

export function RsvpButton({
  scheduleId,
  userAttendance,
  isFull,
  allowWaitlist,
  rsvpDeadline,
}: RsvpButtonProps) {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<
    "attending" | "not_attending" | "maybe" | null
  >(null);
  const [userNote, setUserNote] = useState("");

  const currentStatus = userAttendance?.status;

  // RSVP 마감 여부 확인
  const isRsvpClosed = rsvpDeadline ? new Date(rsvpDeadline) < new Date() : false;

  const handleRsvp = async (status: "attending" | "not_attending" | "maybe") => {
    if (isRsvpClosed) {
      toast.error("RSVP 마감 시간이 지났습니다");
      return;
    }
    setSelectedStatus(status);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!selectedStatus) return;

    try {
      const response = await fetch(`/api/schedules/${scheduleId}/rsvp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: selectedStatus,
          user_note: userNote || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("RSVP 등록에 실패했습니다");
      }

      toast.success(`참석 상태가 "${getStatusLabel(selectedStatus)}"(으)로 변경되었습니다`);
      setShowModal(false);
      setUserNote("");

      // 페이지 새로고침
      window.location.reload();
    } catch (error) {
      console.error("Failed to RSVP:", error);
      toast.error("참석 등록에 실패했습니다");
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "attending":
        return "참석";
      case "not_attending":
        return "불참";
      case "maybe":
        return "미정";
      case "waitlist":
        return "대기";
      default:
        return status;
    }
  };

  const getButtonColor = (status: "attending" | "not_attending" | "maybe") => {
    if (currentStatus === status) {
      switch (status) {
        case "attending":
          return "from-green-500 to-green-600";
        case "not_attending":
          return "from-red-500 to-red-600";
        case "maybe":
          return "from-yellow-500 to-yellow-600";
      }
    }
    return "from-zinc-800 to-zinc-800";
  };

  return (
    <>
      {/* 하단 고정 버튼 */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-800 bg-zinc-900/95 p-4 backdrop-blur-xl md:right-4 md:bottom-4 md:left-auto md:w-auto md:rounded-2xl md:border"
      >
        {/* RSVP 마감 안내 */}
        {isRsvpClosed && (
          <div className="mx-auto mb-3 max-w-3xl rounded-lg bg-red-500/10 px-4 py-2 text-center text-sm text-red-400">
            ⏰ RSVP 마감 시간이 지났습니다
          </div>
        )}

        {/* RSVP 마감 임박 안내 */}
        {!isRsvpClosed && rsvpDeadline && (
          <div className="mx-auto mb-3 max-w-3xl text-center text-xs text-zinc-400">
            마감: {new Date(rsvpDeadline).toLocaleString("ko-KR")}
          </div>
        )}

        <div className="mx-auto flex max-w-3xl gap-2">
          {/* 참석 */}
          <button
            onClick={() => handleRsvp("attending")}
            disabled={(isFull && !allowWaitlist && currentStatus !== "attending") || isRsvpClosed}
            className={`flex-1 rounded-xl bg-gradient-to-r px-6 py-3 font-semibold text-white transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 ${getButtonColor("attending")}`}
          >
            <CheckCircle className="mr-2 inline h-5 w-5" />
            {isFull && currentStatus !== "attending" ? "대기" : "참석"}
            {currentStatus === "attending" && " ✓"}
          </button>

          {/* 미정 */}
          <button
            onClick={() => handleRsvp("maybe")}
            disabled={isRsvpClosed}
            className={`flex-1 rounded-xl bg-gradient-to-r px-6 py-3 font-semibold text-white transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 ${getButtonColor("maybe")}`}
          >
            <HelpCircle className="mr-2 inline h-5 w-5" />
            미정{currentStatus === "maybe" && " ✓"}
          </button>

          {/* 불참 */}
          <button
            onClick={() => handleRsvp("not_attending")}
            disabled={isRsvpClosed}
            className={`flex-1 rounded-xl bg-gradient-to-r px-6 py-3 font-semibold text-white transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 ${getButtonColor("not_attending")}`}
          >
            <XCircle className="mr-2 inline h-5 w-5" />
            불참{currentStatus === "not_attending" && " ✓"}
          </button>
        </div>

        {/* 현재 상태 표시 */}
        {userAttendance && (
          <div className="mx-auto mt-2 max-w-3xl text-center text-xs text-zinc-400">
            현재 상태:{" "}
            <span className="font-semibold text-white">{getStatusLabel(currentStatus || "")}</span>
            {userAttendance.waitlist_position && (
              <span className="ml-1 text-orange-500">
                (대기 {userAttendance.waitlist_position}번)
              </span>
            )}
          </div>
        )}
      </motion.div>

      {/* RSVP 모달 */}
      {showModal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-md -translate-y-1/2 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl"
          >
            <h3 className="mb-4 text-xl font-bold text-white">
              참석 상태: {selectedStatus && getStatusLabel(selectedStatus)}
            </h3>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                메모 (선택사항)
              </label>
              <textarea
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                placeholder="예: 30분 늦을 것 같아요"
                rows={3}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white placeholder-zinc-500 transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
              />
            </div>

            {isFull && selectedStatus === "attending" && (
              <div className="mb-4 flex items-start gap-2 rounded-lg bg-orange-500/10 p-3">
                <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500" />
                <div className="text-sm text-orange-400">
                  정원이 가득 찼습니다. 대기 목록에 등록됩니다.
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 font-medium text-white transition-all hover:bg-zinc-800"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-3 font-medium text-white transition-all hover:from-orange-600 hover:to-orange-700"
              >
                확인
              </button>
            </div>
          </motion.div>
        </>
      )}
    </>
  );
}
