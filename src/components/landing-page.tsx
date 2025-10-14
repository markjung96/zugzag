"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Mountain, Users, TrendingUp, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

import { createClient } from "@/lib/supabase/client";

export default function LandingPage() {
  const [stage, setStage] = useState<"splash" | "intro" | "features" | "cta">("splash");
  const router = useRouter();

  // 타이머 관리용 ref
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  // 타이머 정리 함수
  const clearAllTimers = () => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
  };

  // 타이머 설정 함수
  const setTimer = (callback: () => void, delay: number) => {
    const timer = setTimeout(() => {
      // 타이머 실행 시 배열에서 제거
      timersRef.current = timersRef.current.filter((t) => t !== timer);
      callback();
    }, delay);
    timersRef.current.push(timer);
    return timer;
  };

  // 파티클 속성을 컴포넌트 마운트 시 한 번만 생성
  const [particles] = useState(() =>
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      width: Math.random() * 4 + 2,
      height: Math.random() * 4 + 2,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      xDrift: Math.random() * 20 - 10,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 2,
    })),
  );

  // 로그인 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        router.push("/dashboard");
      }
    };
    checkAuth();
  }, [router]);

  // 사용자 인터렉션으로 마지막 단계로 스킵 (CTA 단계가 아닐 때만)
  useEffect(() => {
    // 이미 마지막 단계면 이벤트 리스너를 등록하지 않음
    if (stage === "cta") return;

    const skipToEnd = () => {
      clearAllTimers();
      setStage("cta");
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " " || e.key === "Enter") {
        skipToEnd();
      }
    };

    window.addEventListener("click", skipToEnd);
    window.addEventListener("touchstart", skipToEnd);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("click", skipToEnd);
      window.removeEventListener("touchstart", skipToEnd);
      window.removeEventListener("keydown", handleKeyDown);
      clearAllTimers();
    };
  }, [stage]);

  useEffect(() => {
    const timer = setTimer(() => setStage("intro"), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (stage === "intro") {
      const timer = setTimer(() => setStage("features"), 2500);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  useEffect(() => {
    if (stage === "features") {
      const timer = setTimer(() => setStage("cta"), 2500);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  const handleStartClick = () => {
    router.push("/login");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950">
      {/* Animated background grid */}
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

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: particle.width,
              height: particle.height,
              background: particle.id % 2 === 0 ? "rgb(255 107 53)" : "rgb(34 211 238)",
              left: particle.left,
              top: particle.top,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, particle.xDrift, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: particle.duration,
              repeat: Number.POSITIVE_INFINITY,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {stage === "splash" && (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 flex min-h-screen items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.8,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              className="relative"
            >
              {/* Glow effect behind logo */}
              <motion.div
                className="absolute inset-0 -z-10 blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                style={{
                  background: "radial-gradient(circle, rgb(255 107 53 / 0.4), transparent 70%)",
                }}
              />

              <Image
                src="/zugzag-logo.png"
                alt="ZUGZAG Logo"
                width={160}
                height={64}
                className="h-16 w-auto md:h-20"
              />
            </motion.div>

            {/* Loading dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-1/3 flex gap-2"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="h-2 w-2 rounded-full bg-orange-500"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}

        {stage === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 md:px-6"
          >
            {/* Character with dynamic entrance */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                duration: 0.7,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              className="relative"
            >
              {/* Radial glow behind character */}
              <motion.div
                className="absolute inset-0 -z-10 scale-150 blur-3xl"
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                  scale: [1.4, 1.6, 1.4],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                style={{
                  background:
                    "radial-gradient(circle, rgb(255 107 53 / 0.3), rgb(34 211 238 / 0.2), transparent)",
                }}
              />

              <motion.img
                src="/zugzag-character.png"
                alt="ZUGZAG Character"
                className="h-48 w-auto drop-shadow-2xl md:h-72"
                animate={{
                  y: [0, -12, 0],
                  rotate: [0, 3, -3, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
            </motion.div>

            {/* Brand name with stagger effect */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-6 text-center md:mt-8"
            >
              <h1 className="mb-3 text-3xl font-bold tracking-tight text-white md:mb-4 md:text-5xl lg:text-6xl">
                ZUGZAG
              </h1>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mx-auto h-1 w-20 rounded-full bg-gradient-to-r from-orange-500 to-cyan-400 md:w-28 lg:w-32"
              />
              <p className="mt-3 text-sm text-zinc-400 md:mt-4 md:text-base lg:text-lg">
                클라이밍 크루의 새로운 시작
              </p>
            </motion.div>
          </motion.div>
        )}

        {stage === "features" && (
          <motion.div
            key="features"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 flex min-h-screen items-center justify-center px-4 md:px-6"
          >
            <div className="grid w-full max-w-4xl gap-4 md:grid-cols-3 md:gap-6">
              {[
                {
                  icon: Mountain,
                  title: "함께 오르기",
                  desc: "크루원들과 함께",
                },
                { icon: Users, title: "크루 관리", desc: "체계적인 운영" },
                {
                  icon: TrendingUp,
                  title: "성장 추적",
                  desc: "기록과 발전",
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm md:p-7"
                >
                  {/* Hover gradient effect */}
                  <motion.div
                    className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background:
                        "radial-gradient(circle at center, rgb(255 107 53 / 0.1), transparent 70%)",
                    }}
                  />

                  <feature.icon className="mb-3 h-10 w-10 text-orange-500 md:mb-4 md:h-12 md:w-12" />
                  <h3 className="mb-2 text-base font-semibold text-white md:text-lg lg:text-xl">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-zinc-400">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {stage === "cta" && (
          <motion.div
            key="cta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 md:px-6"
          >
            {/* Character floating */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative mb-6 md:mb-8"
            >
              <motion.div
                className="absolute inset-0 -z-10 scale-150 blur-3xl"
                animate={{
                  opacity: [0.2, 0.4, 0.2],
                  scale: [1.4, 1.6, 1.4],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                style={{
                  background:
                    "radial-gradient(circle, rgb(255 107 53 / 0.3), rgb(34 211 238 / 0.2), transparent)",
                }}
              />

              <motion.img
                src="/zugzag-character.png"
                alt="ZUGZAG Character"
                className="h-40 w-auto drop-shadow-2xl md:h-56"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
            </motion.div>

            {/* Main content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <h1 className="mb-3 text-3xl font-bold text-white md:mb-4 md:text-4xl lg:text-5xl xl:text-6xl">
                ZUGZAG
              </h1>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mx-auto mb-4 h-1 w-24 rounded-full bg-gradient-to-r from-orange-500 to-cyan-400 md:mb-6 md:w-32 lg:w-40"
              />
              <p className="mb-1 text-base text-zinc-300 md:mb-2 md:text-lg lg:text-xl">
                함께 오르는 즐거움
              </p>
              <p className="text-xs text-zinc-500 md:text-sm lg:text-base">
                크루원들과 함께 더 높은 곳으로
              </p>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 w-full max-w-md px-2 md:mt-10 lg:mt-12"
            >
              <motion.button
                onClick={handleStartClick}
                className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-2xl md:px-7 md:py-3.5 md:text-base"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Animated shine effect */}
                <motion.div
                  className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    translateX: ["100%", "100%", "-100%", "-100%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                />

                <span className="relative flex items-center justify-center gap-2">
                  시작하기
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </motion.button>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-4 text-center text-sm text-zinc-500 md:mt-6 md:text-base"
              >
                이미 계정이 있으신가요?{" "}
                <button
                  onClick={handleStartClick}
                  className="font-semibold text-cyan-400 transition-colors hover:text-cyan-300"
                >
                  로그인
                </button>
              </motion.p>
            </motion.div>

            {/* Bottom decorative element */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-12 flex gap-2 md:mt-16"
            >
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="h-1 w-6 rounded-full bg-zinc-800 md:w-8"
                  animate={{
                    backgroundColor:
                      i === 3
                        ? ["rgb(39 39 42)", "rgb(255 107 53)", "rgb(39 39 42)"]
                        : "rgb(39 39 42)",
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
