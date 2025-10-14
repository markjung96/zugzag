"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, Users, MapPin, Plus, X, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { GymSearchInput, type Gym } from "@/components/gym-search-input";
import { useToast } from "@/components/toast-provider";

import { useUserCrewsQuery, type UserCrewMembership } from "../../crews/_hooks";
import { useCreateScheduleMutation } from "../_hooks";

type EventPhase = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  gym: Gym | null;
  capacity: number;
  note: string;
};

export default function CreateSchedulePage() {
  const router = useRouter();
  const toast = useToast();
  const createScheduleMutation = useCreateScheduleMutation();
  const { data: userCrewsData, isLoading: isLoadingCrews } = useUserCrewsQuery();

  const [crewId, setCrewId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [capacity, setCapacity] = useState(10);
  const [phases, setPhases] = useState<EventPhase[]>([
    {
      id: "1",
      title: "1차",
      startTime: "",
      endTime: "",
      gym: null,
      capacity: 10,
      note: "",
    },
  ]);

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
    if (phases.length === 1) return; // 최소 1개는 유지
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
      // React Query mutation을 통한 일정 생성
      await createScheduleMutation.mutateAsync({
        crew_id: crewId,
        title,
        description,
        event_date: date,
        total_capacity: capacity,
        phases: phases.map((phase, index) => ({
          phase_number: index + 1,
          title: phase.title,
          start_time: phase.startTime,
          end_time: phase.endTime || null,
          gym_id: phase.gym?.id || null,
          location_text: phase.gym?.name || null,
          capacity: phase.capacity,
          notes: phase.note,
        })),
      });

      toast.success("일정이 생성되었습니다!");
      router.push("/schedules");
    } catch (error) {
      console.error("이벤트 생성 오류:", error);
      toast.error(error instanceof Error ? error.message : "일정 생성 중 오류가 발생했습니다.");
    }
  };

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
        <h1 className="text-3xl font-bold text-white">새 일정 만들기</h1>
        <p className="mt-2 text-zinc-400">크루원들과 함께할 클라이밍 일정을 등록하세요</p>
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

          {/* 크루 선택 */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              크루 <span className="text-zinc-500">(선택)</span>
            </label>
            {isLoadingCrews ? (
              <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-zinc-500">
                크루 목록을 불러오는 중...
              </div>
            ) : (
              <select
                value={crewId || ""}
                onChange={(e) => setCrewId(e.target.value || null)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
              >
                <option value="">개인 모임 (크루 없음)</option>
                {userCrewsData?.crews?.map((membership: UserCrewMembership) => (
                  <option key={membership.crew.id} value={membership.crew.id}>
                    {membership.crew.name}
                  </option>
                ))}
              </select>
            )}
            <p className="mt-1 text-xs text-zinc-500">
              크루를 선택하지 않으면 개인 모임으로 등록됩니다
            </p>
          </div>

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
            className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-3 font-medium text-white transition-all hover:from-orange-600 hover:to-orange-700"
          >
            일정 만들기
          </button>
        </motion.div>
      </form>
    </div>
  );
}
