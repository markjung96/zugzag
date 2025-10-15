"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, Loader2, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

import { useDebounce } from "@/hooks/useDebounce";

import { useGymSearchQuery, type Gym } from "../../_hooks/use-gym-search-query";

type GymSearchInputProps = {
  onSelectAction: (gym: Gym) => void;
  placeholder?: string;
  className?: string;
  initialValue?: string;
  autoFocus?: boolean;
  userLocation?: { lat: number; lon: number } | null;
};

export function GymSearchInput({
  onSelectAction,
  placeholder = "암장 검색...",
  className = "",
  initialValue = "",
  autoFocus = false,
  userLocation = null,
}: GymSearchInputProps) {
  const [query, setQuery] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // 암장 검색
  const {
    data: gyms = [],
    isLoading,
    error,
  } = useGymSearchQuery(debouncedQuery, {
    lat: userLocation?.lat,
    lon: userLocation?.lon,
    enabled: true,
  });

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 검색 결과가 있을 때 드롭다운 열기
  useEffect(() => {
    if (debouncedQuery.trim() && (gyms.length > 0 || isLoading || error)) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [debouncedQuery, gyms.length, isLoading, error]);

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (gyms.length > 0) {
          setSelectedIndex((prev) => (prev < gyms.length - 1 ? prev + 1 : prev));
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (gyms.length > 0) {
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        }
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < gyms.length) {
          handleSelect(gyms[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // 선택 처리
  const handleSelect = async (gym: Gym) => {
    // 외부 결과면 먼저 upsert
    if (gym._external) {
      try {
        const res = await fetch("/api/gyms/upsert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: gym.name,
            address: gym.address,
            latitude: gym.latitude,
            longitude: gym.longitude,
            phone: gym.phone,
            website: gym.website,
            provider: gym.provider,
            provider_place_id: gym.provider_place_id,
            metadata: {},
          }),
        });

        if (res.ok) {
          const data = await res.json();
          onSelectAction(data.gym);
        } else {
          // 실패해도 선택은 진행
          onSelectAction(gym);
        }
      } catch (error) {
        console.error("Upsert error:", error);
        onSelectAction(gym);
      }
    } else {
      onSelectAction(gym);
    }

    setQuery(gym.name);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  // 초기화
  const handleClear = () => {
    setQuery("");
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* 입력 필드 */}
      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-zinc-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (gyms.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 pr-10 pl-10 text-white placeholder-zinc-500 transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
        />

        {/* 초기화 버튼 */}
        {query && (
          <button
            onClick={handleClear}
            type="button"
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 검색 결과 드롭다운 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl"
          >
            {/* 로딩 상태 */}
            {isLoading && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              </div>
            )}

            {/* 에러 상태 */}
            {error && (
              <div className="p-4 text-center text-sm text-red-400">
                <p>{error.message}</p>
              </div>
            )}

            {/* 결과 없음 */}
            {!isLoading && !error && gyms.length === 0 && debouncedQuery && (
              <div className="p-4 text-center text-sm text-zinc-400">검색 결과가 없습니다</div>
            )}

            {/* 검색 결과 */}
            {!isLoading && !error && gyms.length > 0 && (
              <div className="max-h-96 overflow-y-auto">
                {gyms.map((gym, idx) => (
                  <button
                    key={gym.id ?? idx}
                    onClick={() => handleSelect(gym)}
                    type="button"
                    className={`flex w-full items-start gap-3 border-b border-zinc-800 p-4 text-left transition-colors last:border-0 ${
                      selectedIndex === idx ? "bg-orange-500/10" : "hover:bg-zinc-800/50"
                    }`}
                  >
                    <div className="mt-1 flex-shrink-0 rounded-lg bg-orange-500/10 p-2">
                      <MapPin className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="truncate font-semibold text-white">{gym.name}</div>
                      {gym.address && (
                        <div className="mt-1 truncate text-sm text-zinc-400">{gym.address}</div>
                      )}
                      <div className="mt-1 flex items-center gap-2">
                        {gym.distance_m !== null && (
                          <span className="text-xs text-zinc-500">
                            {gym.distance_m < 1000
                              ? `${Math.round(gym.distance_m)}m`
                              : `${(gym.distance_m / 1000).toFixed(1)}km`}
                          </span>
                        )}
                        {gym._external && (
                          <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-xs text-cyan-400">
                            외부
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Re-export Gym type for convenience
export type { Gym };
