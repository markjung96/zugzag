"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Mountain,
  Users,
  Check,
  Loader2,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

import { useToast } from "@/components/toast-provider";
import { getCurrentUser } from "@/lib/auth/auth-helpers";
import type { Tables } from "@/lib/supabase/database.types";

type Crew = Tables<"crews"> & {
  member_count?: Array<{ count: number }>;
};

const CLIMBING_LEVELS = [
  {
    value: "beginner",
    label: "🧗 입문 (V0-V2)",
    description: "클라이밍을 시작한지 얼마 안 됐어요",
  },
  {
    value: "intermediate",
    label: "🧗‍♀️ 중급 (V3-V5)",
    description: "웬만한 문제는 해결할 수 있어요",
  },
  { value: "advanced", label: "🏔️ 고급 (V6-V8)", description: "어려운 문제에 도전하고 있어요" },
  { value: "expert", label: "⛰️ 전문가 (V9+)", description: "최고 난이도를 즐깁니다" },
];

function OnboardingContent() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get("invite"); // 초대 코드 가져오기
  const toast = useToast();

  // Step 1: 프로필 완성
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [climbingLevel, setClimbingLevel] = useState("");
  const [bio, setBio] = useState("");

  // Step 2: 크루 선택
  const [crews, setCrews] = useState<Crew[]>([]);
  const [selectedCrewId, setSelectedCrewId] = useState<string | null>(null);
  const [loadingCrews, setLoadingCrews] = useState(false);

  useEffect(() => {
    // ✅ Middleware에서 이미 로그인 체크와 온보딩 완료 여부를 확인하므로
    // 여기서는 사용자 ID만 가져오면 됩니다
    const loadUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        setUserId(user.id);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    // Step 2에서 크루 목록 불러오기
    if (step === 2) {
      fetchCrews();
    }
  }, [step]);

  const fetchCrews = async () => {
    setLoadingCrews(true);
    try {
      const response = await fetch("/api/crews?is_public=true&limit=20");
      if (response.ok) {
        const data = await response.json();
        setCrews(data.crews || []);
      }
    } catch (error) {
      console.error("Error fetching crews:", error);
    } finally {
      setLoadingCrews(false);
    }
  };

  const handleProfileComplete = async () => {
    if (!fullName.trim()) {
      toast.error("이름을 입력해주세요.");
      return;
    }

    if (!climbingLevel) {
      toast.error("클라이밍 레벨을 선택해주세요.");
      return;
    }

    if (!userId) {
      toast.error("사용자 정보를 찾을 수 없습니다.");
      return;
    }

    setIsLoading(true);

    try {
      // API를 통해 프로필 업데이트
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName.trim(),
          nickname: nickname.trim() || null,
          climbing_level: climbingLevel,
          bio: bio || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      toast.success("프로필이 완성되었습니다!");

      // 초대 코드가 있으면 바로 초대 링크 페이지로 이동
      if (inviteCode) {
        // ✅ 하드 리프레시로 프로필 업데이트 반영
        window.location.href = `/crews/join/${inviteCode}`;
      } else {
        setStep(2);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("프로필 업데이트에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCrewSelection = async () => {
    setIsLoading(true);

    try {
      // 크루 선택 시 가입
      if (selectedCrewId) {
        const response = await fetch(`/api/crews/${selectedCrewId}/join`, {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Failed to join crew");
        }

        toast.success("크루에 가입했습니다!");
      }

      // ✅ 하드 리프레시로 프로필 업데이트 반영
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Error joining crew:", error);
      toast.error("크루 가입에 실패했습니다.");
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    if (step === 1) {
      setStep(2);
    } else {
      // ✅ 하드 리프레시
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgb(255 107 53 / 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(255 107 53 / 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 md:p-6"
        >
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : null)}
            className={`flex items-center gap-2 transition-colors ${
              step > 1 ? "text-zinc-400 hover:text-white" : "invisible"
            }`}
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">이전</span>
          </button>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/zugzag-logo.png" alt="ZUGZAG" className="h-6 w-auto md:h-7" />

          <button
            onClick={handleSkip}
            className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
          >
            건너뛰기
          </button>
        </motion.div>

        {/* Progress Bar */}
        <div className="px-4 md:px-6">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center gap-2">
              {[1, 2].map((s) => (
                <div key={s} className="flex-1">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      s <= step ? "bg-gradient-to-r from-orange-500 to-orange-600" : "bg-zinc-800"
                    }`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 text-center text-sm text-zinc-500">{step}/2 단계</div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex flex-1 items-center justify-center px-4 py-8 md:px-6">
          <div className="w-full max-w-2xl">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <ProfileStep
                  key="profile"
                  fullName={fullName}
                  setFullName={setFullName}
                  nickname={nickname}
                  setNickname={setNickname}
                  climbingLevel={climbingLevel}
                  setClimbingLevel={setClimbingLevel}
                  bio={bio}
                  setBio={setBio}
                  isLoading={isLoading}
                  onNext={handleProfileComplete}
                />
              ) : (
                <CrewStep
                  key="crew"
                  crews={crews}
                  selectedCrewId={selectedCrewId}
                  setSelectedCrewId={setSelectedCrewId}
                  isLoading={isLoading || loadingCrews}
                  onComplete={handleCrewSelection}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileStep({
  fullName,
  setFullName,
  nickname,
  setNickname,
  climbingLevel,
  setClimbingLevel,
  bio,
  setBio,
  isLoading,
  onNext,
}: {
  fullName: string;
  setFullName: (value: string) => void;
  nickname: string;
  setNickname: (value: string) => void;
  climbingLevel: string;
  setClimbingLevel: (value: string) => void;
  bio: string;
  setBio: (value: string) => void;
  isLoading: boolean;
  onNext: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* 아이콘 */}
      <div className="mb-6 flex justify-center">
        <div className="rounded-full bg-gradient-to-r from-orange-500 to-cyan-400 p-4">
          <Mountain className="h-12 w-12 text-white" />
        </div>
      </div>

      <h2 className="mb-2 text-center text-2xl font-bold text-white md:text-3xl">
        클라이밍 프로필 완성
      </h2>
      <p className="mb-8 text-center text-sm text-zinc-400 md:text-base">
        당신의 클라이밍 레벨을 알려주세요
      </p>

      <div className="space-y-6">
        {/* 이름 입력 */}
        <div>
          <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-zinc-300">
            이름 <span className="text-orange-500">*</span>
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="본명을 입력해주세요 (예: 홍길동)"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-white placeholder-zinc-500 backdrop-blur-sm transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
          />
        </div>

        {/* 닉네임 입력 (선택) */}
        <div>
          <label htmlFor="nickname" className="mb-2 block text-sm font-medium text-zinc-300">
            닉네임 (선택)
          </label>
          <input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임을 입력해주세요 (예: 산토끼)"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-white placeholder-zinc-500 backdrop-blur-sm transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
          />
          <p className="mt-1 text-xs text-zinc-500">닉네임을 입력하지 않으면 이름으로 표시됩니다</p>
        </div>

        {/* 클라이밍 레벨 선택 */}
        <div>
          <label className="mb-3 block text-sm font-medium text-zinc-300">
            클라이밍 레벨 <span className="text-orange-500">*</span>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            {CLIMBING_LEVELS.map((level) => (
              <motion.button
                key={level.value}
                type="button"
                onClick={() => setClimbingLevel(level.value)}
                className={`relative rounded-xl border p-4 text-left transition-all ${
                  climbingLevel === level.value
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {climbingLevel === level.value && (
                  <div className="absolute top-3 right-3">
                    <Check className="h-5 w-5 text-orange-500" />
                  </div>
                )}
                <div className="mb-1 font-semibold text-white">{level.label}</div>
                <div className="text-xs text-zinc-400">{level.description}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* 자기소개 (선택) */}
        <div>
          <label htmlFor="bio" className="mb-2 block text-sm font-medium text-zinc-300">
            자기소개 (선택)
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={200}
            placeholder="클라이밍에 대한 당신의 이야기를 들려주세요..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-white placeholder-zinc-500 backdrop-blur-sm transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
          />
          <div className="mt-1 text-right text-xs text-zinc-500">{bio.length}/200</div>
        </div>

        {/* 다음 버튼 */}
        <motion.button
          type="button"
          onClick={onNext}
          disabled={isLoading || !climbingLevel || !fullName.trim()}
          className="group relative mt-6 w-full overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 font-semibold text-white shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-50"
          whileHover={!isLoading && climbingLevel && fullName.trim() ? { scale: 1.01, y: -2 } : {}}
          whileTap={!isLoading && climbingLevel && fullName.trim() ? { scale: 0.99 } : {}}
        >
          <span className="relative flex items-center justify-center gap-2">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                다음
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}

function CrewStep({
  crews,
  selectedCrewId,
  setSelectedCrewId,
  isLoading,
  onComplete,
}: {
  crews: Crew[];
  selectedCrewId: string | null;
  setSelectedCrewId: (id: string | null) => void;
  isLoading: boolean;
  onComplete: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* 아이콘 */}
      <div className="mb-6 flex justify-center">
        <div className="rounded-full bg-gradient-to-r from-orange-500 to-cyan-400 p-4">
          <Users className="h-12 w-12 text-white" />
        </div>
      </div>

      <h2 className="mb-2 text-center text-2xl font-bold text-white md:text-3xl">크루 선택</h2>
      <p className="mb-8 text-center text-sm text-zinc-400 md:text-base">
        함께할 크루를 선택하거나 나중에 선택할 수 있어요
      </p>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        </div>
      ) : crews.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
          <Users className="mx-auto mb-3 h-12 w-12 text-zinc-600" />
          <p className="text-zinc-400">현재 가입 가능한 크루가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="max-h-96 space-y-3 overflow-y-auto pr-2">
            {crews.map((crew) => {
              const memberCount = crew.member_count?.[0]?.count || 0;

              return (
                <motion.button
                  key={crew.id}
                  type="button"
                  onClick={() => setSelectedCrewId(selectedCrewId === crew.id ? null : crew.id)}
                  className={`relative w-full rounded-xl border p-4 text-left transition-all ${
                    selectedCrewId === crew.id
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {selectedCrewId === crew.id && (
                    <div className="absolute top-4 right-4">
                      <Check className="h-5 w-5 text-orange-500" />
                    </div>
                  )}

                  <div className="mb-2 flex items-start gap-3 pr-8">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-cyan-400 text-sm font-bold text-white">
                      {crew.name[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{crew.name}</div>
                      {crew.description && (
                        <div className="mt-1 line-clamp-1 text-sm text-zinc-400">
                          {crew.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    {crew.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {crew.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {memberCount}명{crew.max_members && ` / ${crew.max_members}명`}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* 완료 버튼 */}
          <motion.button
            type="button"
            onClick={onComplete}
            disabled={isLoading}
            className="group relative mt-6 w-full overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 font-semibold text-white shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-50"
            whileHover={!isLoading ? { scale: 1.01, y: -2 } : {}}
            whileTap={!isLoading ? { scale: 0.99 } : {}}
          >
            <span className="relative flex items-center justify-center gap-2">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {selectedCrewId ? "크루 가입하고 시작하기" : "나중에 선택하기"}
                  <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </span>
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-950">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
