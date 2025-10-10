"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Mail, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useToast } from "@/components/toast-provider";
import { resetPassword } from "@/lib/auth/auth-helpers";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await resetPassword(email);
      toast.success("비밀번호 재설정 링크를 전송했습니다!");
      setSuccess(true);
    } catch (err) {
      console.error("비밀번호 재설정 실패:", err);
      toast.error("이메일 전송에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
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
            className="max-w-md text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-6 flex justify-center"
            >
              <div className="rounded-full bg-gradient-to-r from-orange-500 to-cyan-400 p-4">
                <CheckCircle2 className="h-16 w-16 text-white" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-3 text-xl font-bold text-white md:mb-4 md:text-2xl lg:text-3xl"
            >
              이메일을 확인하세요
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-4 text-sm text-zinc-400 md:mb-6 md:text-base"
            >
              <span className="font-medium text-orange-400">{email}</span>로 비밀번호 재설정 링크를
              보냈습니다.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-6 text-xs text-zinc-500 md:mb-8 md:text-sm lg:text-base"
            >
              이메일이 오지 않았다면 스팸 폴더를 확인해주세요.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Link href="/login">
                <motion.button
                  className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-lg md:px-6 md:py-3.5 md:text-base"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  로그인으로 돌아가기
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
        {/* 헤더 */}
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
              <span className="text-sm font-medium md:text-base">로그인으로</span>
            </motion.button>
          </Link>

          <Link href="/">
            <motion.img
              src="/zugzag-logo.png"
              alt="ZUGZAG"
              className="h-7 w-auto md:h-9"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            />
          </Link>
        </motion.div>

        {/* 메인 콘텐츠 */}
        <div className="flex flex-1 flex-col items-center justify-center px-4 pb-12 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full max-w-md"
          >
            {/* 캐릭터 */}
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

            {/* 타이틀 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-6 text-center md:mb-8"
            >
              <h1 className="mb-2 text-xl font-bold text-white md:mb-3 md:text-2xl lg:text-3xl">
                비밀번호 찾기
              </h1>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mx-auto mb-3 h-1 w-16 rounded-full bg-gradient-to-r from-orange-500 to-cyan-400 md:mb-4 md:w-20 lg:w-24"
              />
              <p className="text-sm text-zinc-400 md:text-base">
                가입하신 이메일을 입력하시면
                <br />
                비밀번호 재설정 링크를 보내드립니다
              </p>
            </motion.div>

            {/* 폼 */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              onSubmit={handleSubmit}
              className="space-y-6"
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
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50 md:px-6 md:py-3.5 md:text-base"
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
                  재설정 링크 보내기
                </span>
              </motion.button>
            </motion.form>

            {/* 추가 링크 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-6 text-center text-sm text-zinc-500 md:mt-8 md:text-base"
            >
              <Link href="/login" className="transition-colors hover:text-cyan-400">
                로그인으로 돌아가기
              </Link>
              <span className="mx-2">•</span>
              <Link href="/signup" className="transition-colors hover:text-cyan-400">
                회원가입
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
