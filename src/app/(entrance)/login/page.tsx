"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/components/toast-provider";
import { signInWithGoogle, signInWithGithub, signInWithEmail } from "@/lib/auth/auth-helpers";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signInWithEmail(email, password);
      toast.success("로그인에 성공했습니다!");
      router.push("/dashboard");
    } catch (err) {
      console.error("로그인 실패:", err);
      toast.error("이메일 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);

    try {
      await signInWithGoogle();
      // OAuth는 자동으로 리다이렉트됨
    } catch (err) {
      console.error("Google 로그인 실패:", err);
      toast.error("Google 로그인에 실패했습니다. 다시 시도해주세요.");
      setIsLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setIsLoading(true);

    try {
      await signInWithGithub();
      // OAuth는 자동으로 리다이렉트됨
    } catch (err) {
      console.error("GitHub 로그인 실패:", err);
      toast.error("GitHub 로그인에 실패했습니다. 다시 시도해주세요.");
      setIsLoading(false);
    }
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
          <Link href="/">
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
                크루원 로그인
              </h1>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mx-auto mb-3 h-1 w-16 rounded-full bg-gradient-to-r from-orange-500 to-cyan-400 md:mb-4 md:w-20 lg:w-24"
              />
              <p className="text-sm text-zinc-400 md:text-base">ZUGZAG에 오신 것을 환영합니다</p>
            </motion.div>

            {/* 로그인 폼 */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
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
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-zinc-300 md:mb-2 md:text-base"
                >
                  비밀번호
                </label>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-zinc-500 md:left-4 md:h-6 md:w-6" />
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 pr-3 pl-10 text-sm text-white placeholder-zinc-500 backdrop-blur-sm transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none md:py-3.5 md:pr-4 md:pl-12 md:text-base"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm md:text-base">
                <label className="flex items-center text-zinc-400">
                  <input
                    type="checkbox"
                    className="mr-1.5 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-orange-500 focus:ring-2 focus:ring-orange-500/20 md:mr-2 md:h-5 md:w-5"
                  />
                  로그인 상태 유지
                </label>
                <Link
                  href="/forgot-password"
                  className="text-cyan-400 transition-colors hover:text-cyan-300"
                >
                  비밀번호 찾기
                </Link>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                className="group relative mt-5 w-full overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50 md:mt-6 md:px-6 md:py-3.5 md:text-base"
                whileHover={!isLoading ? { scale: 1.01, y: -1 } : {}}
                whileTap={!isLoading ? { scale: 0.99 } : {}}
              >
                {/* Animated shine effect */}
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
                  로그인
                </span>
              </motion.button>
            </motion.form>

            {/* 소셜 로그인 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-6 md:mt-8"
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-sm md:text-base">
                  <span className="bg-zinc-950 px-3 text-zinc-500 md:px-4">또는</span>
                </div>
              </div>

              <div className="mt-4 space-y-2.5 md:mt-6 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
                <motion.button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="flex w-full items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-zinc-800/50 disabled:cursor-not-allowed disabled:opacity-50 md:px-4 md:py-3.5 md:text-base"
                  whileHover={!isLoading ? { scale: 1.02 } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                >
                  <svg className="mr-1.5 h-5 w-5 md:mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </motion.button>

                <motion.button
                  type="button"
                  onClick={handleGithubLogin}
                  disabled={isLoading}
                  className="flex w-full items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-zinc-800/50 disabled:cursor-not-allowed disabled:opacity-50 md:px-4 md:py-3.5 md:text-base"
                  whileHover={!isLoading ? { scale: 1.02 } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                >
                  <svg className="mr-1.5 h-5 w-5 md:mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                    />
                  </svg>
                  GitHub
                </motion.button>
              </div>
            </motion.div>

            {/* 회원가입 링크 */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-6 text-center text-sm text-zinc-500 md:mt-8 md:text-base"
            >
              아직 크루원이 아니신가요?{" "}
              <Link
                href="/signup"
                className="font-semibold text-cyan-400 transition-colors hover:text-cyan-300"
              >
                가입하기
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
