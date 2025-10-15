"use client";

import { motion } from "framer-motion";
import { Users, ArrowLeft, AlertCircle } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

import { DatePicker } from "@/components/date-picker";
import { DateTimePicker } from "@/components/datetime-picker";
import { useToast } from "@/components/toast-provider";

import { useScheduleDetailQuery, useUpdateScheduleMutation } from "../../_hooks";

export default function EditSchedulePage() {
  const router = useRouter();
  const params = useParams();
  const scheduleId = params.id as string;
  const toast = useToast();

  const { data: scheduleData, isLoading } = useScheduleDetailQuery(scheduleId);
  const updateScheduleMutation = useUpdateScheduleMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [capacity, setCapacity] = useState(10);
  const [visibility, setVisibility] = useState<"crew" | "link" | "public">("crew");
  const [rsvpDeadline, setRsvpDeadline] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const schedule = scheduleData?.schedule;

  // 스케줄 데이터가 로드되면 폼 초기화
  useEffect(() => {
    if (schedule) {
      setTitle(schedule.title);
      setDescription(schedule.description || "");
      setDate(schedule.event_date);
      setCapacity(schedule.total_capacity || 10);
      setVisibility((schedule.visibility as "crew" | "link" | "public") || "crew");
      setRsvpDeadline(
        schedule.rsvp_deadline ? new Date(schedule.rsvp_deadline).toISOString().slice(0, 16) : "",
      );
      setTags(schedule.tags || []);
      setNotes(schedule.notes || "");
    }
  }, [schedule]);

  // 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!title.trim()) {
      toast.error("일정 제목을 입력해주세요.");
      return;
    }

    if (!date) {
      toast.error("날짜를 선택해주세요.");
      return;
    }

    try {
      await updateScheduleMutation.mutateAsync({
        id: scheduleId,
        data: {
          title,
          description,
          event_date: date,
          total_capacity: capacity,
          is_public: visibility === "public",
          visibility,
          rsvp_deadline: rsvpDeadline || undefined,
          tags,
          notes,
        },
      });

      toast.success("일정이 수정되었습니다!");
      router.push(`/schedules/${scheduleId}`);
    } catch (error) {
      console.error("일정 수정 오류:", error);
      toast.error(error instanceof Error ? error.message : "일정 수정 중 오류가 발생했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-orange-500" />
          <p className="text-sm text-zinc-400">일정 불러오는 중...</p>
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

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      {/* 헤더 */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-zinc-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
          뒤로가기
        </button>
        <h1 className="text-3xl font-bold text-white">일정 수정</h1>
        <p className="mt-2 text-zinc-400">일정 정보를 수정하세요</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
        {/* 기본 정보 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
        >
          <h2 className="mb-4 text-xl font-semibold text-white">기본 정보</h2>

          {/* 크루 정보 (읽기 전용) */}
          {schedule.crew && (
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-zinc-300">크루</label>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-zinc-400">
                {schedule.crew.name}
              </div>
              <p className="mt-1 text-xs text-zinc-500">크루는 수정할 수 없습니다</p>
            </div>
          )}

          {/* 제목 */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              일정 제목 <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 주말 클라이밍"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
              required
            />
          </div>

          {/* 설명 */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-zinc-300">설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="일정에 대한 간단한 설명을 입력하세요"
              rows={3}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
            />
          </div>

          {/* 날짜 & 정원 */}
          <div className="mb-4 grid gap-4 md:grid-cols-2">
            <DatePicker label="날짜" value={date} onChange={setDate} required />

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">전체 정원</label>
              <div className="relative">
                <Users className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  min={1}
                  max={100}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 pr-4 pl-10 text-white transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* RSVP 마감 시간 */}
          <div className="mb-4">
            <DateTimePicker
              label="RSVP 마감 시간 (선택)"
              value={rsvpDeadline}
              onChange={setRsvpDeadline}
            />
            <p className="mt-1 text-xs text-zinc-500">
              마감 시간 이후에는 참석 등록 및 변경이 불가능합니다
            </p>
          </div>

          {/* 공개범위 설정 */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-zinc-300">공개 범위</label>
            <div className="grid gap-3 md:grid-cols-3">
              <button
                type="button"
                onClick={() => setVisibility("crew")}
                className={`rounded-xl border p-4 text-left transition-all ${
                  visibility === "crew"
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                }`}
              >
                <div className="mb-1 font-semibold text-white">🔒 크루 전용</div>
                <div className="text-xs text-zinc-400">크루 멤버만 볼 수 있습니다</div>
              </button>

              <button
                type="button"
                onClick={() => setVisibility("link")}
                className={`rounded-xl border p-4 text-left transition-all ${
                  visibility === "link"
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                }`}
              >
                <div className="mb-1 font-semibold text-white">🔗 링크 공유</div>
                <div className="text-xs text-zinc-400">링크를 아는 사람만 볼 수 있습니다</div>
              </button>

              <button
                type="button"
                onClick={() => setVisibility("public")}
                className={`rounded-xl border p-4 text-left transition-all ${
                  visibility === "public"
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                }`}
              >
                <div className="mb-1 font-semibold text-white">🌍 전체 공개</div>
                <div className="text-xs text-zinc-400">모든 사용자가 볼 수 있습니다</div>
              </button>
            </div>
            {visibility === "public" && (
              <div className="mt-2 rounded-lg bg-cyan-500/10 px-3 py-2 text-xs text-cyan-400">
                ℹ️ 전체 공개 시 검색 및 추천에 노출될 수 있습니다
              </div>
            )}
          </div>

          {/* 메모 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">운영 메모</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="운영진만 볼 수 있는 메모"
              rows={3}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
            />
          </div>
        </motion.div>

        {/* 단계 정보 안내 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6 backdrop-blur-xl"
        >
          <h3 className="mb-2 text-lg font-semibold text-cyan-400">
            📍 단계별 일정 정보 (1차/2차 등)
          </h3>
          <p className="text-sm text-zinc-400">
            단계별 정보(시간, 장소 등)는 일정 생성 후 수정할 수 없습니다. 새로 만들어주세요.
          </p>
        </motion.div>

        {/* 제출 버튼 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-4"
        >
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 font-medium text-white transition-all hover:bg-zinc-800"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={updateScheduleMutation.isPending}
            className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-3 font-medium text-white transition-all hover:from-orange-600 hover:to-orange-700 disabled:opacity-50"
          >
            {updateScheduleMutation.isPending ? "수정 중..." : "수정 완료"}
          </button>
        </motion.div>
      </form>
    </div>
  );
}
