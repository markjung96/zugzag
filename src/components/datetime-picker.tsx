"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface DateTimePickerProps {
  value: string; // YYYY-MM-DDTHH:mm format
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  min?: string;
  max?: string;
}

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const MONTHS = [
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
];

export function DateTimePicker({
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  className = "",
  min,
  max,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<"date" | "time">("date");

  // Date state
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      return new Date(value);
    }
    return new Date();
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    if (value) {
      return new Date(value);
    }
    return null;
  });

  // Time state
  const [hour, setHour] = useState(() => {
    if (value) {
      const date = new Date(value);
      return date.getHours();
    }
    return new Date().getHours();
  });
  const [minute, setMinute] = useState(() => {
    if (value) {
      const date = new Date(value);
      return date.getMinutes();
    }
    return 0;
  });

  const containerRef = useRef<HTMLDivElement>(null);

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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const formatDateTime = (date: Date, h: number, m: number) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = h.toString().padStart(2, "0");
    const minutes = m.toString().padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const formatDisplayDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return "날짜와 시간 선택";
    const date = new Date(dateTimeStr);
    const period = date.getHours() >= 12 ? "오후" : "오전";
    const displayHour =
      date.getHours() === 0 ? 12 : date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${period} ${displayHour}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  const handleDateSelect = (day: number) => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const newDate = new Date(year, month, day);
    setSelectedDate(newDate);
    setActiveTab("time");
  };

  const handleConfirm = () => {
    if (!selectedDate) return;

    const dateTimeString = formatDateTime(selectedDate, hour, minute);

    // min/max 검증
    if (min && dateTimeString < min) return;
    if (max && dateTimeString > max) return;

    onChange(dateTimeString);
    setIsOpen(false);
  };

  const handleNow = () => {
    const now = new Date();
    setSelectedDate(now);
    setViewDate(now);
    setHour(now.getHours());
    setMinute(now.getMinutes());
    onChange(now.toISOString().slice(0, 16));
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1));
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

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(viewDate);
    const firstDay = getFirstDayOfMonth(viewDate);
    const days = [];

    // 빈 칸 채우기
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    // 날짜 채우기
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      const dateString = currentDate.toISOString().split("T")[0];
      const isSelected =
        selectedDate &&
        currentDate.getFullYear() === selectedDate.getFullYear() &&
        currentDate.getMonth() === selectedDate.getMonth() &&
        currentDate.getDate() === selectedDate.getDate();
      const isToday = currentDate.getTime() === today.getTime();
      const isDisabled = Boolean(
        (min && dateString < min.split("T")[0]) || (max && dateString > max.split("T")[0]),
      );

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => !isDisabled && handleDateSelect(day)}
          disabled={isDisabled}
          className={`aspect-square rounded-lg text-sm font-medium transition-all ${
            isSelected
              ? "bg-orange-500 text-white"
              : isToday
                ? "border-2 border-orange-500 text-orange-500"
                : isDisabled
                  ? "cursor-not-allowed text-zinc-700"
                  : "text-zinc-300 hover:bg-zinc-800"
          } `}
        >
          {day}
        </button>,
      );
    }

    return days;
  };

  const dateContent = (
    <div className="p-4">
      {/* 헤더 */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-lg font-semibold text-white">
          {viewDate.getFullYear()}년 {MONTHS[viewDate.getMonth()]}
        </div>
        <button
          type="button"
          onClick={handleNextMonth}
          className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {DAYS.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-zinc-500">
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
    </div>
  );

  const timeContent = (
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
      <div className="grid grid-cols-4 gap-2">
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
    </div>
  );

  const pickerContent = (
    <>
      {/* 탭 */}
      <div className="flex border-b border-zinc-800">
        <button
          type="button"
          onClick={() => setActiveTab("date")}
          className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
            activeTab === "date"
              ? "border-b-2 border-orange-500 text-orange-500"
              : "text-zinc-400 hover:text-zinc-300"
          }`}
        >
          <Calendar className="h-4 w-4" />
          날짜
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("time")}
          disabled={!selectedDate}
          className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all disabled:opacity-30 ${
            activeTab === "time"
              ? "border-b-2 border-orange-500 text-orange-500"
              : "text-zinc-400 hover:text-zinc-300"
          }`}
        >
          <Clock className="h-4 w-4" />
          시간
        </button>
      </div>

      {/* 컨텐츠 */}
      {activeTab === "date" ? dateContent : timeContent}

      {/* 액션 버튼 */}
      <div className="border-t border-zinc-800 p-4">
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
            disabled={!selectedDate}
            className="flex-1 rounded-lg bg-orange-500 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
          >
            확인
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className={className}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          {label} {required && <span className="text-orange-500">*</span>}
        </label>
      )}

      <div ref={containerRef} className="relative">
        {/* Input Trigger */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(true)}
          disabled={disabled}
          className="flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-left text-white transition-all hover:border-zinc-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className={value ? "text-white" : "text-zinc-500"}>
            {formatDisplayDateTime(value)}
          </span>
          <div className="flex gap-2">
            <Calendar className="h-5 w-5 text-zinc-400" />
            <Clock className="h-5 w-5 text-zinc-400" />
          </div>
        </button>

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
              {pickerContent}
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
              className="pb-safe fixed inset-x-0 bottom-0 z-[100] max-h-[85vh] overflow-auto rounded-t-3xl border-t border-zinc-800 bg-zinc-900"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-900 p-4">
                <h3 className="text-lg font-semibold text-white">날짜 및 시간 선택</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {pickerContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
