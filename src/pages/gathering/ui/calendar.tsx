import React, { useState, useCallback, useRef, TouchEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { DailyMeetings } from '../mock';

interface CalendarProps {
  onDateSelect?: (date: Date | null) => void;
  meetings?: DailyMeetings;
}

interface TouchState {
  startX: number;
  currentX: number;
}

const Calendar = ({ onDateSelect, meetings = {} }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [touchState, setTouchState] = useState<TouchState | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [transitioning, setTransitioning] = useState<-1 | 0 | 1>(0);
  const calendarRef = useRef<HTMLDivElement>(null);

  // 달력 데이터 생성
  const generateCalendarData = useCallback((baseDate: Date) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startingDayIndex = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const calendarDays = [];

    // 이전 달의 날짜들
    for (let i = 0; i < startingDayIndex; i++) {
      const prevDate = new Date(year, month, -startingDayIndex + i + 1);
      calendarDays.push({
        date: prevDate,
        isCurrentMonth: false,
      });
    }

    // 현재 달의 날짜들
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // 다음 달의 날짜들 (42개 채우기)
    const remainingDays = 42 - calendarDays.length;
    for (let i = 1; i <= remainingDays; i++) {
      calendarDays.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return calendarDays;
  }, []);

  // 월 변경 핸들러
  const handleMonthChange = (increment: -1 | 1) => {
    if (transitioning !== 0) return;

    setTransitioning(-increment as -1 | 0 | 1); // increment를 반대로

    setTimeout(() => {
      setCurrentDate((prev) => addMonths(prev, increment));
      setTransitioning(0);
    }, 300);
  };

  // 날짜 선택 핸들러
  const handleDateClick = (date: Date) => {
    if (!isDragging) {
      // 이미 선택된 날짜를 다시 클릭하면 선택 해제
      if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
        setSelectedDate(null);
        if (onDateSelect) {
          onDateSelect(null);
        }
      } else {
        setSelectedDate(date);
        if (onDateSelect) {
          onDateSelect(date);
        }
      }
    }
  };

  // 해당 날짜에 모임이 있는지 확인
  const hasMeetings = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return meetings[dateKey] && meetings[dateKey].length > 0;
  };

  // 터치 이벤트 핸들러
  const handleTouchStart = (e: TouchEvent) => {
    if (transitioning !== 0) return;
    setTouchState({
      startX: e.touches[0].clientX,
      currentX: e.touches[0].clientX,
    });
    setIsDragging(true);
  };

  const handleTouchEnd = () => {
    if (!touchState) return;

    const diff = touchState.currentX - touchState.startX;
    const threshold = window.innerWidth * 0.3; // 30% 이상 드래그시 전환

    if (Math.abs(diff) > threshold) {
      // 드래그 방향에 따른 전환 방향을 반대로 수정
      const direction = diff > 0 ? -1 : 1; // 여기를 반대로 변경
      setTransitioning(-direction as -1 | 0 | 1);

      setTimeout(() => {
        setCurrentDate((prev) => addMonths(prev, direction));
        setTransitioning(0);
      }, 300);
    }

    setTouchState(null);
    setIsDragging(false);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!touchState || transitioning !== 0) return;
    setTouchState((prev) => ({
      ...prev!,
      currentX: e.touches[0].clientX,
    }));
  };

  const getDragOffset = () => {
    if (!touchState) {
      // 전환 중일 때는 해당 방향으로 전체 너비만큼 이동
      if (transitioning !== 0) {
        return transitioning * window.innerWidth;
      }
      return 0;
    }
    const diff = touchState.currentX - touchState.startX;
    const maxDrag = window.innerWidth;
    return Math.max(Math.min(diff, maxDrag), -maxDrag);
  };

  // 위치 및 전환 스타일 계산
  const getTransformStyle = (monthOffset: number) => {
    const baseOffset = monthOffset * -100; // 기본 위치는 반대로
    const dragOffset = (getDragOffset() / window.innerWidth) * 100; // 드래그는 원래 방향대로
    const totalOffset = baseOffset + dragOffset;

    const shouldAnimate = touchState === null && transitioning !== 0;

    return {
      transform: `translateX(${totalOffset}%)`,
      transition: shouldAnimate ? 'transform 300ms ease-out' : 'none',
    };
  };

  // 캘린더 그리드 렌더링 함수
  const renderCalendarGrid = (data: ReturnType<typeof generateCalendarData>) => {
    return (
      <div className="grid grid-cols-7 gap-1">
        {data.map((dayData, index) => {
          const isSelected = selectedDate && dayData.date.toDateString() === selectedDate.toDateString();
          const hasEvent = hasMeetings(dayData.date);
          const dateKey = format(dayData.date, 'yyyy-MM-dd');

          return (
            <button
              key={index}
              className={`
                aspect-square p-1 text-center relative transition-colors
                ${dayData.isCurrentMonth ? 'dark:text-white text-gray-800' : 'dark:text-gray-500 text-gray-400'}
                ${isSelected ? 'dark:bg-blue-900 bg-blue-100 rounded-full' : 'dark:hover:bg-gray-700 hover:bg-gray-100'}
                active:bg-blue-200
                touch-manipulation
              `}
              onClick={() => handleDateClick(dayData.date)}
            >
              <span className="text-sm">{dayData.date.getDate()}</span>
              {hasEvent && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
                  {meetings[dateKey].map((_, i) => (
                    <div key={i} className="w-1 h-1 rounded-full bg-primary" />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  const prevMonthData = generateCalendarData(addMonths(currentDate, -1));
  const currentMonthData = generateCalendarData(currentDate);
  const nextMonthData = generateCalendarData(addMonths(currentDate, 1));
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div
      className="w-full mx-auto rounded-lg p-4 transition-colors duration-200 overflow-hidden
      dark:bg-gray-800 bg-white dark:text-white text-gray-800"
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <button
          className="p-2 rounded-full transition-colors
            dark:hover:bg-gray-700 hover:bg-gray-100 
            dark:text-gray-200 text-gray-600"
          onClick={() => handleMonthChange(-1)}
          disabled={transitioning !== 0}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-semibold">
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
        </h2>
        <button
          className="p-2 rounded-full transition-colors
            dark:hover:bg-gray-700 hover:bg-gray-100
            dark:text-gray-200 text-gray-600"
          onClick={() => handleMonthChange(1)}
          disabled={transitioning !== 0}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium py-2
              dark:text-gray-300 text-gray-600"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 슬라이딩 캘린더 컨테이너 */}
      <div className="relative overflow-hidden">
        <div
          ref={calendarRef}
          className="relative w-full select-none touch-pan-x"
          style={{ height: '360px' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* 이전 달 */}
          <div className="absolute w-full" style={getTransformStyle(1)}>
            {renderCalendarGrid(prevMonthData)}
          </div>
          {/* 현재 달 */}
          <div className="absolute w-full" style={getTransformStyle(0)}>
            {renderCalendarGrid(currentMonthData)}
          </div>
          {/* 다음 달 */}
          <div className="absolute w-full" style={getTransformStyle(-1)}>
            {renderCalendarGrid(nextMonthData)}
          </div>
        </div>
      </div>
    </div>
  );
};

export { Calendar };
