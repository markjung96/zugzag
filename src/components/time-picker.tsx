"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Clock, X, ChevronUp, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface TimePickerProps {
  value: string; // HH:mm format
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  allowKeyboardInput?: boolean; // 키보드 입력 허용 여부
}

export function TimePicker({
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  className = "",
  allowKeyboardInput = true,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hour, setHour] = useState(() => {
    if (value) {
      const [h] = value.split(":");
      return parseInt(h, 10);
    }
    return new Date().getHours();
  });
  const [minute, setMinute] = useState(() => {
    if (value) {
      const [, m] = value.split(":");
      return parseInt(m, 10);
    }
    return 0;
  });
  const [inputValue, setInputValue] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 모바일/데스크탑 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 외부 클릭 감지 (데스크탑용)
  useEffect(() => {
    if (isMobile || !isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isOpen]);

  // ESC 키로 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // value 변경 시 hour/minute 업데이트
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":");
      setHour(parseInt(h, 10));
      setMinute(parseInt(m, 10));
      setInputValue(value);
    }
  }, [value]);

  // 키보드 입력 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // HH:mm 형식 검증 (실시간)
    if (/^\d{0,2}:?\d{0,2}$/.test(newValue)) {
      // 자동 콜론 삽입
      if (newValue.length === 2 && !newValue.includes(":")) {
        setInputValue(newValue + ":");
      }
    }
  };

  const handleInputBlur = () => {
    // 입력값 검증 및 적용
    const timeRegex = /^(\d{1,2}):(\d{2})$/;
    const match = inputValue.match(timeRegex);

    if (match) {
      const h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);

      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        setHour(h);
        setMinute(m);
        onChange(formatTime(h, m));
        setInputValue(formatTime(h, m));
        return;
      }
    }

    // 유효하지 않으면 이전 값으로 복원
    if (value) {
      setInputValue(value);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleInputBlur();
      inputRef.current?.blur();
    }
  };

  const formatTime = (h: number, m: number) => {
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  const formatDisplayTime = (timeStr: string) => {
    if (!timeStr) return "시간 선택";
    const [h, m] = timeStr.split(":");
    const hour = parseInt(h, 10);
    const period = hour >= 12 ? "오후" : "오전";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${period} ${displayHour}:${m}`;
  };

  const handleConfirm = () => {
    onChange(formatTime(hour, minute));
    setIsOpen(false);
  };

  const handleNow = () => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    setHour(h);
    setMinute(m);
    onChange(formatTime(h, m));
    setIsOpen(false);
  };

  const handleHourChange = (delta: number) => {
    setHour((prev) => {
      let newHour = prev + delta;
      if (newHour < 0) newHour = 23;
      if (newHour > 23) newHour = 0;
      return newHour;
    });
  };

  const handleMinuteChange = (delta: number) => {
    setMinute((prev) => {
      let newMinute = prev + delta;
      if (newMinute < 0) newMinute = 55;
      if (newMinute > 59) newMinute = 0;
      return newMinute;
    });
  };

  const timePickerContent = (
    <div className="p-4">
      {/* 시간 선택 UI */}
      <div className="mb-6 flex items-center justify-center gap-4">
        {/* 시 */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => handleHourChange(1)}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
          <div className="my-2 w-20 rounded-xl border-2 border-orange-500 bg-zinc-900 py-4 text-center text-3xl font-bold text-white">
            {hour.toString().padStart(2, "0")}
          </div>
          <button
            type="button"
            onClick={() => handleHourChange(-1)}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
          <div className="mt-2 text-sm text-zinc-500">시</div>
        </div>

        <div className="text-3xl font-bold text-zinc-600">:</div>

        {/* 분 */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => handleMinuteChange(5)}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
          <div className="my-2 w-20 rounded-xl border-2 border-orange-500 bg-zinc-900 py-4 text-center text-3xl font-bold text-white">
            {minute.toString().padStart(2, "0")}
          </div>
          <button
            type="button"
            onClick={() => handleMinuteChange(-5)}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
          <div className="mt-2 text-sm text-zinc-500">분</div>
        </div>
      </div>

      {/* 빠른 선택 버튼 */}
      <div className="mb-4 grid grid-cols-4 gap-2">
        {[
          { label: "00:00", h: 0, m: 0 },
          { label: "06:00", h: 6, m: 0 },
          { label: "09:00", h: 9, m: 0 },
          { label: "12:00", h: 12, m: 0 },
          { label: "14:00", h: 14, m: 0 },
          { label: "18:00", h: 18, m: 0 },
          { label: "21:00", h: 21, m: 0 },
          { label: "23:59", h: 23, m: 59 },
        ].map((time) => (
          <button
            key={time.label}
            type="button"
            onClick={() => {
              setHour(time.h);
              setMinute(time.m);
            }}
            className={`rounded-lg border py-2 text-xs font-medium transition-all ${
              hour === time.h && minute === time.m
                ? "border-orange-500 bg-orange-500/10 text-orange-500"
                : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            {time.label}
          </button>
        ))}
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleNow}
          className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          현재 시간
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="flex-1 rounded-lg bg-orange-500 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
        >
          확인
        </button>
      </div>
    </div>
  );

  return (
    <div className={className}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          {label} {required && <span className="text-orange-500">*</span>}
        </label>
      )}

      <div ref={containerRef} className="relative">
        {/* Input Field with Keyboard Support */}
        <div className="relative">
          <Clock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-zinc-400" />
          {allowKeyboardInput ? (
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              onFocus={() => !disabled && setIsOpen(true)}
              placeholder="00:00"
              disabled={disabled}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 pr-10 pl-10 text-white placeholder-zinc-500 transition-all hover:border-zinc-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          ) : (
            <button
              type="button"
              onClick={() => !disabled && setIsOpen(true)}
              disabled={disabled}
              className="flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 py-3 pr-4 pl-10 text-left text-white transition-all hover:border-zinc-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className={value ? "text-white" : "text-zinc-500"}>
                {formatDisplayTime(value)}
              </span>
            </button>
          )}
          {/* Picker Toggle Button */}
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white disabled:opacity-50"
          >
            <Clock className="h-4 w-4" />
          </button>
        </div>

        {/* Desktop: Dropdown */}
        <AnimatePresence>
          {isOpen && !isMobile && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-[200] mt-2 w-full min-w-[320px] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl"
            >
              {timePickerContent}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile: Drawer */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="pb-safe fixed inset-x-0 bottom-0 z-[100] max-h-[80vh] overflow-auto rounded-t-3xl border-t border-zinc-800 bg-zinc-900"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-900 p-4">
                <h3 className="text-lg font-semibold text-white">시간 선택</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {timePickerContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
