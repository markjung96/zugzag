"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Mail, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useToast } from "@/components/toast-provider";
import { createClient } from "@/lib/supabase/client";

export default function ResendVerificationPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("이메일을 입력해주세요.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("유효한 이메일 주소를 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      // ✅ Magic Link 방식으로 이메일 인증 재발송
      // signInWithOtp는 이메일 미인증 사용자에게도 작동합니다
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: false, // 이미 존재하는 사용자에게만 발송
        },
      });

      if (error) {
        console.error("이메일 발송 실패:", error);

        // 사용자가 없는 경우
        if (error.message?.includes("User not found") || error.message?.includes("not found")) {
          toast.error("등록되지 않은 이메일입니다. 회원가입을 먼저 진행해주세요.");
        } else {
          toast.error("이메일 발송에 실패했습니다. 다시 시도해주세요.");
        }
      } else {
        setShowSuccess(true);
      }
    } catch (err) {
      console.error("예외 발생:", err);
      toast.error("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-zinc-950">
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

        <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-6 flex justify-center"
            >
              <div className="rounded-full bg-gradient-to-r from-orange-500 to-cyan-400 p-4">
                <Mail className="h-16 w-16 text-white" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-3 text-xl font-bold text-white md:mb-4 md:text-2xl lg:text-3xl"
            >
              이메일을 확인해주세요
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6 space-y-3 md:mb-8"
            >
              <p className="text-sm text-zinc-400 md:text-base">
                <span className="font-semibold text-orange-400">{email}</span>
                <br />
                으로 인증 메일을 재발송했습니다.
              </p>
              <p className="text-sm text-zinc-400 md:text-base">
                메일함에서 인증 링크를 클릭하면
                <br />
                자동으로 로그인되고 온보딩이 시작됩니다.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-sm md:p-6"
            >
              <div className="mb-3 flex items-center justify-center gap-2 text-cyan-400">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm font-semibold md:text-base">주의 사항</span>
              </div>
              <ul className="space-y-2 text-left text-xs text-zinc-500 md:text-sm">
                <li className="flex items-start gap-2">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500" />
                  <span>인증 링크는 24시간 동안 유효하며, 1회만 사용 가능합니다</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500" />
                  <span>링크를 여러 번 클릭하면 무효화될 수 있습니다</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500" />
                  <span>메일이 오지 않았다면 스팸 메일함을 확인해주세요</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 md:mt-8"
            >
              <Link href="/login">
                <motion.button
                  className="text-sm font-medium text-zinc-400 transition-colors hover:text-white md:text-base"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  로그인 페이지로 돌아가기
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950">
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

      <div className="absolute inset-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              background: i % 2 === 0 ? "rgb(255 107 53)" : "rgb(34 211 238)",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between p-4 md:p-6"
        >
          <Link href="/login">
            <motion.button
              className="flex items-center gap-2 text-zinc-400 transition-colors hover:text-white"
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
              <span className="text-sm font-medium md:text-base">돌아가기</span>
            </motion.button>
          </Link>

          <Link href="/">
            <motion.img
              src="/zugzag-logo.png"
              alt="ZUGZAG"
              className="h-6 w-auto md:h-7"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            />
          </Link>
        </motion.div>

        <div className="flex flex-1 flex-col items-center justify-center px-4 pb-12 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full max-w-md"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative mb-8 flex justify-center"
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
                className="h-24 w-auto drop-shadow-2xl md:h-32"
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-6 text-center md:mb-8"
            >
              <h1 className="mb-2 text-xl font-bold text-white md:mb-3 md:text-2xl lg:text-3xl">
                이메일 인증 재발송
              </h1>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mx-auto mb-3 h-1 w-16 rounded-full bg-gradient-to-r from-orange-500 to-cyan-400 md:mb-4 md:w-20 lg:w-24"
              />
              <p className="text-sm text-zinc-400 md:text-base">
                인증 링크가 만료되었나요?
                <br />
                새로운 인증 링크를 받을 수 있습니다
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-6 rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-4 md:mb-8"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-cyan-400" />
                <div className="text-xs text-zinc-300 md:text-sm">
                  <p className="mb-2 font-semibold text-cyan-400">이메일 인증 링크 만료</p>
                  <p>
                    인증 링크는 24시간 동안만 유효합니다. 링크가 만료되었거나 이미 사용한 경우,
                    아래에서 새로운 인증 링크를 받을 수 있습니다.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-zinc-300 md:mb-2 md:text-base"
                >
                  이메일
                </label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-zinc-500 md:left-4 md:h-6 md:w-6" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 pr-3 pl-10 text-sm text-white placeholder-zinc-500 backdrop-blur-sm transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none md:py-3.5 md:pr-4 md:pl-12 md:text-base"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <p className="mt-1.5 text-xs text-zinc-500 md:text-sm">
                  가입 시 사용한 이메일 주소를 입력하세요
                </p>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                className="group relative mt-6 w-full overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50 md:px-6 md:py-3.5 md:text-base"
                whileHover={!isLoading ? { scale: 1.01, y: -1 } : {}}
                whileTap={!isLoading ? { scale: 0.99 } : {}}
              >
                {!isLoading && (
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
                )}
                <span className="relative flex items-center justify-center gap-2">
                  {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                  인증 이메일 재발송
                </span>
              </motion.button>
            </motion.form>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-6 text-center text-sm text-zinc-500 md:mt-8 md:text-base"
            >
              계정이 없으신가요?{" "}
              <Link
                href="/signup"
                className="font-semibold text-cyan-400 transition-colors hover:text-cyan-300"
              >
                회원가입하기
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
