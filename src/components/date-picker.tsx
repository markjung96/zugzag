"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface DatePickerProps {
  value: string; // YYYY-MM-DD format
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

export function DatePicker({
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  className = "",
  min,
  max,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      // YYYY-MM-DD 형식을 직접 파싱하여 시간대 문제 방지
      const [year, month, day] = value.split("-").map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date();
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

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "날짜 선택";
    // YYYY-MM-DD 형식을 직접 파싱하여 시간대 문제 방지
    const [year, month, day] = dateStr.split("-").map(Number);
    return `${year}년 ${month}월 ${day}일`;
  };

  const handleDateSelect = (day: number) => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    // YYYY-MM-DD 형식을 수동으로 생성하여 시간대 문제 방지
    const monthStr = (month + 1).toString().padStart(2, "0");
    const dayStr = day.toString().padStart(2, "0");
    const dateString = `${year}-${monthStr}-${dayStr}`;

    // min/max 검증
    if (min && dateString < min) return;
    if (max && dateString > max) return;

    onChange(dateString);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1));
  };

  const handleToday = () => {
    const today = new Date();
    // YYYY-MM-DD 형식을 수동으로 생성하여 시간대 문제 방지
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const day = today.getDate().toString().padStart(2, "0");
    const todayString = `${year}-${month}-${day}`;

    // min/max 검증
    if (min && todayString < min) return;
    if (max && todayString > max) return;

    onChange(todayString);
    setViewDate(today);
    setIsOpen(false);
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
    // YYYY-MM-DD 형식을 직접 파싱하여 시간대 문제 방지
    let selectedDate = null;
    if (value) {
      const [year, month, day] = value.split("-").map(Number);
      selectedDate = new Date(year, month - 1, day);
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      // YYYY-MM-DD 형식을 수동으로 생성하여 시간대 문제 방지
      const year = currentDate.getFullYear();
      const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
      const dayStr = day.toString().padStart(2, "0");
      const dateString = `${year}-${month}-${dayStr}`;
      const isSelected =
        selectedDate &&
        currentDate.getFullYear() === selectedDate.getFullYear() &&
        currentDate.getMonth() === selectedDate.getMonth() &&
        currentDate.getDate() === selectedDate.getDate();
      const isToday = currentDate.getTime() === today.getTime();
      const isDisabled = (min && dateString < min) || (max && dateString > max);

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => !isDisabled && handleDateSelect(day)}
          disabled={isDisabled ? true : false}
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

  const calendarContent = (
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
      <div className="mb-4 grid grid-cols-7 gap-1">{renderCalendar()}</div>

      {/* 액션 버튼 */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleToday}
          className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          오늘
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
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
        {/* Input Trigger */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(true)}
          disabled={disabled}
          className="flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 py-3 pr-4 pl-10 text-left text-white transition-all hover:border-zinc-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Calendar className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-zinc-400" />
          <span className={value ? "text-white" : "text-zinc-500"}>{formatDisplayDate(value)}</span>
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
              {calendarContent}
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
                <h3 className="text-lg font-semibold text-white">날짜 선택</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {calendarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
