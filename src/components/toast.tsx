"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react";
import { useEffect } from "react";

import type { PanInfo } from "framer-motion";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastComponentProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colors = {
  success: {
    bg: "bg-gradient-to-r from-emerald-500/90 to-green-500/90",
    border: "border-emerald-400/30",
    icon: "text-white",
    glow: "shadow-emerald-500/20",
  },
  error: {
    bg: "bg-gradient-to-r from-red-500/90 to-rose-500/90",
    border: "border-red-400/30",
    icon: "text-white",
    glow: "shadow-red-500/20",
  },
  warning: {
    bg: "bg-gradient-to-r from-amber-500/90 to-orange-500/90",
    border: "border-amber-400/30",
    icon: "text-white",
    glow: "shadow-amber-500/20",
  },
  info: {
    bg: "bg-gradient-to-r from-cyan-500/90 to-blue-500/90",
    border: "border-cyan-400/30",
    icon: "text-white",
    glow: "shadow-cyan-500/20",
  },
};

export function ToastComponent({ toast, onClose }: ToastComponentProps) {
  const Icon = icons[toast.type];
  const style = colors[toast.type];

  useEffect(() => {
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onClose]);

  const handleDragEnd = (_event: unknown, info: PanInfo) => {
    // 스와이프로 닫기 (모바일)
    if (Math.abs(info.offset.x) > 100 || Math.abs(info.offset.y) > 100) {
      onClose(toast.id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      className={` ${style.bg} ${style.border} ${style.glow} relative flex w-full max-w-sm cursor-grab items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-md active:cursor-grabbing md:max-w-md`}
    >
      {/* 아이콘 */}
      <div className="flex-shrink-0">
        <Icon className={`${style.icon} h-5 w-5 md:h-6 md:w-6`} />
      </div>

      {/* 메시지 */}
      <p className="flex-1 text-sm font-medium text-white md:text-base">{toast.message}</p>

      {/* 닫기 버튼 */}
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 rounded-lg p-1 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="닫기"
      >
        <X className="h-4 w-4 md:h-5 md:w-5" />
      </button>

      {/* Progress bar */}
      {toast.duration && toast.duration > 0 && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 rounded-bl-xl bg-white/30"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: toast.duration / 1000, ease: "linear" }}
        />
      )}
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <>
      {/* 데스크탑: 상단 중앙 */}
      <div className="pointer-events-none fixed top-0 right-0 left-0 z-50 hidden md:flex md:justify-center">
        <div className="pointer-events-auto flex w-full max-w-md flex-col gap-3 p-4">
          <AnimatePresence mode="popLayout">
            {toasts.map((toast) => (
              <ToastComponent key={toast.id} toast={toast} onClose={onClose} />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* 모바일: 하단 */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center md:hidden">
        <div className="pointer-events-auto flex w-full flex-col gap-3 p-4">
          <AnimatePresence mode="popLayout">
            {toasts.map((toast) => (
              <ToastComponent key={toast.id} toast={toast} onClose={onClose} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
