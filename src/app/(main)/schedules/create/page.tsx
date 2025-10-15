"use client";

import { motion } from "framer-motion";
import { Users, MapPin, Plus, X, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import {
  GymSearchInput,
  type Gym,
} from "@/app/(main)/schedules/create/_components/gym-search-input";
import {
  KakaoPlaceSearchInput,
  type KakaoPlace,
} from "@/app/(main)/schedules/create/_components/kakao-place-search-input";
import { DatePicker } from "@/components/date-picker";
import { DateTimePicker } from "@/components/datetime-picker";
import { Dropdown } from "@/components/dropdown";
import { TimePicker } from "@/components/time-picker";
import { useToast } from "@/components/toast-provider";

import { useUserCrewsQuery, type UserCrewMembership } from "../../crews/_hooks";
import { useCreateScheduleMutation } from "../_hooks";

type EventPhase = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  // 활동 타입
  phaseType: "exercise" | "meal" | "afterparty";
  exerciseType: "climbing" | "gym" | "running" | "hiking" | "other";
  // 암장 정보 (운동일 때)
  gym: Gym | null;
  // 카카오 장소 정보 (식사/뒷풀이일 때)
  kakaoPlace: KakaoPlace | null;
  capacity: number;
  note: string;
};

// 단계별 폼 컴포넌트
type PhaseFormProps = {
  phase: EventPhase;
  phaseIndex: number;
  phasesLength: number;
  userLocation: { lat: number; lon: number } | null;
  onUpdate: <K extends keyof EventPhase>(id: string, field: K, value: EventPhase[K]) => void;
  onRemove: (id: string) => void;
};

function PhaseForm({
  phase,
  phaseIndex,
  phasesLength,
  userLocation,
  onUpdate,
  onRemove,
}: PhaseFormProps) {
  // GymSearchInput과 KakaoPlaceSearchInput이 자체적으로 query와 debounce, 데이터 fetching을 관리합니다.

  // 마지막 phase가 가장 높은 z-index를 가지도록 (역순)
  // 이렇게 해야 각 phase의 dropdown이 아래 phase 카드들에 가려지지 않음
  const zIndex = 50 - phaseIndex;

  return (
    <div
      className="relative rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
      style={{ zIndex }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{phase.title}</h3>
        {phasesLength > 1 && (
          <button
            type="button"
            onClick={() => onRemove(phase.id)}
            className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-red-500"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* 활동 타입 선택 */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          활동 타입 <span className="text-orange-500">*</span>
        </label>
        <div className="grid gap-2 md:grid-cols-3">
          <button
            type="button"
            onClick={() => {
              onUpdate(phase.id, "phaseType", "exercise");
              onUpdate(phase.id, "kakaoPlace", null);
            }}
            className={`rounded-lg border p-3 text-left transition-all ${
              phase.phaseType === "exercise"
                ? "border-orange-500 bg-orange-500/10"
                : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
            }`}
          >
            <div className="font-semibold text-white">💪 운동</div>
            <div className="text-xs text-zinc-400">클라이밍 등</div>
          </button>
          <button
            type="button"
            onClick={() => {
              onUpdate(phase.id, "phaseType", "meal");
              onUpdate(phase.id, "gym", null);
            }}
            className={`rounded-lg border p-3 text-left transition-all ${
              phase.phaseType === "meal"
                ? "border-orange-500 bg-orange-500/10"
                : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
            }`}
          >
            <div className="font-semibold text-white">🍽️ 식사</div>
            <div className="text-xs text-zinc-400">함께 식사</div>
          </button>
          <button
            type="button"
            onClick={() => {
              onUpdate(phase.id, "phaseType", "afterparty");
              onUpdate(phase.id, "gym", null);
            }}
            className={`rounded-lg border p-3 text-left transition-all ${
              phase.phaseType === "afterparty"
                ? "border-orange-500 bg-orange-500/10"
                : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
            }`}
          >
            <div className="font-semibold text-white">🎉 뒷풀이</div>
            <div className="text-xs text-zinc-400">2차, 3차</div>
          </button>
        </div>
      </div>

      {/* 운동 세부 타입 (운동일 때만) */}
      {/* {phase.phaseType === "exercise" && (
        <div className="mb-4">
          <Dropdown
            label="운동 종류"
            options={[
              { value: "climbing", label: "클라이밍" },
              { value: "gym", label: "헬스" },
              { value: "running", label: "러닝" },
              { value: "hiking", label: "등산" },
              { value: "other", label: "기타" },
            ]}
            value={phase.exerciseType}
            onChange={(value) =>
              onUpdate(
                phase.id,
                "exerciseType",
                value as "climbing" | "gym" | "running" | "hiking" | "other",
              )
            }
          />
        </div>
      )} */}

      {/* 시간 */}
      <div className="mb-4 grid gap-4 md:grid-cols-2">
        <TimePicker
          label="시작 시간"
          value={phase.startTime}
          onChange={(value) => onUpdate(phase.id, "startTime", value)}
          required
        />

        <TimePicker
          label="종료 시간"
          value={phase.endTime}
          onChange={(value) => onUpdate(phase.id, "endTime", value)}
        />
      </div>

      {/* 장소 검색 - 운동일 때는 암장 검색 */}
      {phase.phaseType === "exercise" && (
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
                onClick={() => onUpdate(phase.id, "gym", null)}
                className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <GymSearchInput
              onSelectAction={(gym) => {
                onUpdate(phase.id, "gym", gym);
              }}
              placeholder="암장 이름으로 검색..."
              userLocation={userLocation}
            />
          )}
        </div>
      )}

      {/* 장소 검색 - 식사/뒷풀이일 때는 카카오 장소 검색 */}
      {(phase.phaseType === "meal" || phase.phaseType === "afterparty") && (
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-zinc-300">
            <MapPin className="mr-1 inline h-4 w-4" />
            장소 <span className="text-orange-500">*</span>
          </label>
          {phase.kakaoPlace ? (
            <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
              <div>
                <div className="font-semibold text-white">{phase.kakaoPlace.name}</div>
                <div className="text-sm text-zinc-400">{phase.kakaoPlace.address}</div>
              </div>
              <button
                type="button"
                onClick={() => onUpdate(phase.id, "kakaoPlace", null)}
                className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <KakaoPlaceSearchInput
              onSelectAction={(place) => {
                onUpdate(phase.id, "kakaoPlace", place);
              }}
              placeholder={
                phase.phaseType === "meal" ? "식당 이름으로 검색..." : "장소 이름으로 검색..."
              }
              category={phase.phaseType === "meal" ? "food" : "all"}
            />
          )}
        </div>
      )}

      {/* 정원 & 메모 */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">단계별 정원</label>
          <input
            type="number"
            value={phase.capacity}
            onChange={(e) => onUpdate(phase.id, "capacity", Number(e.target.value))}
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
            onChange={(e) => onUpdate(phase.id, "note", e.target.value)}
            placeholder="예: 초보자 환영"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}

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
  const [visibility, setVisibility] = useState<"crew" | "link" | "public">("crew");
  const [rsvpDeadline, setRsvpDeadline] = useState("");
  const [phases, setPhases] = useState<EventPhase[]>([
    {
      id: "1",
      title: "1차",
      startTime: "",
      endTime: "",
      phaseType: "exercise",
      exerciseType: "climbing",
      gym: null,
      kakaoPlace: null,
      capacity: 10,
      note: "",
    },
  ]);

  // 사용자 위치 가져오기
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("위치 정보를 가져올 수 없습니다:", error.message);
        },
      );
    }
  }, []);

  // 단계 추가
  const addPhase = () => {
    const newPhase: EventPhase = {
      id: Date.now().toString(),
      title: `${phases.length + 1}차`,
      startTime: "",
      endTime: "",
      phaseType: "exercise",
      exerciseType: "climbing",
      gym: null,
      kakaoPlace: null,
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
  const updatePhase = <K extends keyof EventPhase>(id: string, field: K, value: EventPhase[K]) => {
    setPhases((prevPhases) => prevPhases.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
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

    if (
      phases.some((p) => {
        if (!p.startTime) return true;
        // 운동일 때는 암장 필수
        if (p.phaseType === "exercise" && !p.gym) return true;
        // 식사/뒷풀이일 때는 카카오 장소 필수
        if ((p.phaseType === "meal" || p.phaseType === "afterparty") && !p.kakaoPlace) return true;
        return false;
      })
    ) {
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
        is_public: visibility === "public",
        visibility,
        rsvp_deadline: rsvpDeadline || undefined,
        phases: phases.map((phase, index) => ({
          phase_number: index + 1,
          title: phase.title,
          start_time: phase.startTime,
          end_time: phase.endTime || null,
          phase_type: phase.phaseType,
          exercise_type: phase.exerciseType,
          // 운동일 때는 암장 정보
          gym_id: phase.phaseType === "exercise" ? phase.gym?.id || null : null,
          location_text: phase.phaseType === "exercise" ? phase.gym?.name || null : null,
          // 식사/뒷풀이일 때는 카카오 장소 정보
          location_kakao_id: phase.phaseType !== "exercise" ? phase.kakaoPlace?.id || null : null,
          location_kakao_name:
            phase.phaseType !== "exercise" ? phase.kakaoPlace?.name || null : null,
          location_kakao_address:
            phase.phaseType !== "exercise" ? phase.kakaoPlace?.address || null : null,
          location_kakao_category:
            phase.phaseType !== "exercise" ? phase.kakaoPlace?.category || null : null,
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
          type="button"
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
          className="relative z-10 mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
          style={{
            zIndex: 51,
          }}
        >
          <h2 className="mb-4 text-xl font-semibold text-white">기본 정보</h2>

          {/* 크루 선택 */}
          <div className="mb-4">
            <div className="mb-2">
              <span className="text-sm font-medium text-zinc-300">
                크루 <span className="text-zinc-500">(선택)</span>
              </span>
            </div>
            {isLoadingCrews ? (
              <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-zinc-500">
                크루 목록을 불러오는 중...
              </div>
            ) : (
              <Dropdown
                options={[
                  { value: "", label: "개인 모임 (크루 없음)" },
                  ...(userCrewsData?.crews?.map((membership: UserCrewMembership) => ({
                    value: membership.crew.id,
                    label: membership.crew.name,
                  })) || []),
                ]}
                value={crewId || ""}
                onChange={(value) => setCrewId(value || null)}
                placeholder="개인 모임 (크루 없음)"
              />
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
          <div>
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
            {phases.map((phase, index) => (
              <PhaseForm
                key={phase.id}
                phase={phase}
                phaseIndex={index}
                phasesLength={phases.length}
                userLocation={userLocation}
                onUpdate={updatePhase}
                onRemove={removePhase}
              />
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
