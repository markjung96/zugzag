"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, X, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";

import { useDebounce } from "@/hooks/useDebounce";

import {
  useKakaoPlaceSearchQuery,
  type KakaoPlace,
} from "../../_hooks/use-kakao-place-search-query";

type KakaoPlaceSearchInputProps = {
  onSelectAction: (place: KakaoPlace) => void;
  placeholder?: string;
  className?: string;
  initialValue?: string;
  autoFocus?: boolean;
  category?: "food" | "cafe" | "all";
};

export function KakaoPlaceSearchInput({
  onSelectAction,
  placeholder = "장소를 검색하세요...",
  className = "",
  initialValue = "",
  autoFocus = false,
  category = "all",
}: KakaoPlaceSearchInputProps) {
  const [query, setQuery] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // 카카오 장소 검색
  const {
    data: places = [],
    isLoading,
    error,
  } = useKakaoPlaceSearchQuery(debouncedQuery, {
    category,
    enabled: true,
  });

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
    if (debouncedQuery.trim().length >= 2 && (places.length > 0 || isLoading || error)) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [debouncedQuery, places.length, isLoading, error]);

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (places.length > 0) {
          setSelectedIndex((prev) => (prev < places.length - 1 ? prev + 1 : prev));
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (places.length > 0) {
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        }
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < places.length) {
          handleSelectPlace(places[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelectPlace = (place: KakaoPlace) => {
    onSelectAction(place);
    setQuery(place.name);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleClear = () => {
    setQuery("");
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const getCategoryDisplay = (categoryName: string) => {
    // 카카오 카테고리 포맷: "음식점 > 카페" 등
    return categoryName.split(">").slice(-1)[0].trim();
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* 검색 입력 필드 */}
      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-zinc-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (places.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 pr-10 pl-10 text-white placeholder-zinc-500 transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
        />
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
            {!isLoading && !error && places.length === 0 && debouncedQuery && (
              <div className="p-4 text-center text-sm text-zinc-400">검색 결과가 없습니다</div>
            )}

            {/* 검색 결과 */}
            {!isLoading && !error && places.length > 0 && (
              <div className="max-h-96 overflow-y-auto">
                {places.map((place, idx) => (
                  <button
                    key={place.id}
                    onClick={() => handleSelectPlace(place)}
                    type="button"
                    className={`flex w-full items-start gap-3 border-b border-zinc-800 p-4 text-left transition-colors last:border-0 ${
                      selectedIndex === idx ? "bg-orange-500/10" : "hover:bg-zinc-800/50"
                    }`}
                  >
                    <div className="mt-1 flex-shrink-0 rounded-lg bg-orange-500/10 p-2">
                      <MapPin className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="truncate font-semibold text-white">{place.name}</div>
                      <div className="mt-1 truncate text-xs text-zinc-500">
                        {getCategoryDisplay(place.category)}
                      </div>
                      <div className="mt-1 truncate text-sm text-zinc-400">{place.address}</div>
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

// Re-export KakaoPlace type for convenience
export type { KakaoPlace };
