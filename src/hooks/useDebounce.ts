import { useEffect, useState } from "react";

/**
 * 디바운스 훅 - 입력값이 변경된 후 일정 시간 대기 후 값 반환
 * @param value 디바운스할 값
 * @param delay 지연 시간 (ms)
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
