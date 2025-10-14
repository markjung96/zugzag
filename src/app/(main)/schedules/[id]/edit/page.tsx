"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, Users, MapPin, Plus, X, ArrowLeft, Save } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

import { GymSearchInput, type Gym } from "@/components/gym-search-input";
import { useToast } from "@/components/toast-provider";

import { useScheduleDetailQuery } from "../../_hooks";

type EventPhase = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  gym: Gym | null;
  capacity: number;
  note: string;
};

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const toast = useToast();

  const { data, isLoading } = useScheduleDetailQuery(eventId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [capacity, setCapacity] = useState(10);
  const [phases, setPhases] = useState<EventPhase[]>([]);

  useEffect(() => {
    if (!data?.schedule) return;

    const schedule = data.schedule;

    // 기존 데이터로 폼 채우기
    setTitle(schedule.title);
    setDescription(schedule.description || "");
    setDate(schedule.event_date);
    setCapacity(schedule.total_capacity || 10);
    setPhases(
      schedule.phases.map((phase) => ({
        id: phase.id,
        title: phase.title,
        startTime: phase.start_time,
        endTime: phase.end_time || "",
        gym: phase.gym
          ? {
              id: phase.gym.id,
              name: phase.gym.name,
              address: phase.gym.address || null,
              latitude: phase.gym.latitude || null,
              longitude: phase.gym.longitude || null,
              phone: phase.gym.phone || null,
              website: phase.gym.website || null,
              provider: phase.gym.provider || null,
              provider_place_id: phase.gym.provider_place_id || null,
              distance_m: null,
              score: null,
            }
          : null,
        capacity: phase.capacity || 10,
        note: phase.notes || "",
      })),
    );
  }, [data]);

  // 단계 추가
  const addPhase = () => {
    const newPhase: EventPhase = {
      id: Date.now().toString(),
      title: `${phases.length + 1}차`,
      startTime: "",
      endTime: "",
      gym: null,
      capacity: 10,
      note: "",
    };
    setPhases([...phases, newPhase]);
  };

  // 단계 제거
  const removePhase = (id: string) => {
    if (phases.length === 1) return;
    setPhases(phases.filter((p) => p.id !== id));
  };

  // 단계 업데이트
  const updatePhase = (
    id: string,
    field: keyof EventPhase,
    value: string | number | Gym | null,
  ) => {
    setPhases(phases.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

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

    if (phases.some((p) => !p.startTime || !p.gym)) {
      toast.error("모든 단계의 시간과 장소를 입력해주세요.");
      return;
    }

    try {
      // TODO: API 호출로 일정 수정 구현 필요
      // await updateScheduleMutation.mutateAsync({
      //   id: eventId,
      //   title,
      //   description,
      //   event_date: date,
      //   total_capacity: capacity,
      // });

      toast.info("일정 수정 기능은 준비 중입니다");
      router.push(`/schedules/${eventId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "일정 수정 중 오류가 발생했습니다.");
    }
  };

  if (isLoading || !data?.schedule) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-orange-500" />
          <p className="text-sm text-zinc-400">불러오는 중...</p>
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
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                날짜 <span className="text-orange-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 pr-4 pl-10 text-white transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                  required
                />
              </div>
            </div>

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
        </motion.div>

        {/* 단계별 정보 (1차/2차) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">단계별 일정</h2>
            <button
              type="button"
              onClick={addPhase}
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
            >
              <Plus className="h-4 w-4" />
              단계 추가
            </button>
          </div>

          <div className="space-y-4">
            {phases.map((phase) => (
              <div
                key={phase.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">{phase.title}</h3>
                  {phases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePhase(phase.id)}
                      className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-red-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {/* 시간 */}
                <div className="mb-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                      시작 시간 <span className="text-orange-500">*</span>
                    </label>
                    <div className="relative">
                      <Clock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="time"
                        value={phase.startTime}
                        onChange={(e) => updatePhase(phase.id, "startTime", e.target.value)}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 pr-4 pl-10 text-white transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                      종료 시간
                    </label>
                    <div className="relative">
                      <Clock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="time"
                        value={phase.endTime}
                        onChange={(e) => updatePhase(phase.id, "endTime", e.target.value)}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 pr-4 pl-10 text-white transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 장소 검색 */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    <MapPin className="mr-1 inline h-4 w-4" />
                    암장 <span className="text-orange-500">*</span>
                  </label>
                  {phase.gym ? (
                    <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
                      <div>
                        <div className="font-semibold text-white">{phase.gym.name}</div>
                        {phase.gym.address && (
                          <div className="text-sm text-zinc-400">{phase.gym.address}</div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => updatePhase(phase.id, "gym", null)}
                        className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <GymSearchInput
                      onSelectAction={(gym) => updatePhase(phase.id, "gym", gym)}
                      placeholder="암장 이름으로 검색..."
                    />
                  )}
                </div>

                {/* 정원 & 메모 */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                      단계별 정원
                    </label>
                    <input
                      type="number"
                      value={phase.capacity}
                      onChange={(e) => updatePhase(phase.id, "capacity", Number(e.target.value))}
                      min={1}
                      max={100}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">메모</label>
                    <input
                      type="text"
                      value={phase.note}
                      onChange={(e) => updatePhase(phase.id, "note", e.target.value)}
                      placeholder="예: 초보자 환영"
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-3 font-medium text-white transition-all hover:from-orange-600 hover:to-orange-700"
          >
            <Save className="h-5 w-5" />
            수정 완료
          </button>
        </motion.div>
      </form>
    </div>
  );
}
