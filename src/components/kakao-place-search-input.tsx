"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

import type { KakaoPlace } from "../app/(main)/schedules/_hooks/use-kakao-place-search-query";

type KakaoPlaceSearchInputProps = {
  onSelectAction: (place: KakaoPlace) => void;
  placeholder?: string;
  places: KakaoPlace[];
  isLoading: boolean;
  error: Error | null;
};

export function KakaoPlaceSearchInput({
  onSelectAction,
  placeholder = "장소를 검색하세요...",
  places,
  isLoading,
  error,
}: KakaoPlaceSearchInputProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
    if (query.trim().length >= 2 && (places.length > 0 || isLoading || error)) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [query, places.length, isLoading, error]);

  const handleSelectPlace = (place: KakaoPlace) => {
    onSelectAction(place);
    setQuery("");
    setIsOpen(false);
  };

  const getCategoryDisplay = (categoryName: string) => {
    // 카카오 카테고리 포맷: "음식점 > 카페" 등
    return categoryName.split(">").slice(-1)[0].trim();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* 검색 입력 필드 */}
      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-zinc-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 pr-10 pl-10 text-white placeholder-zinc-500 transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
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
            {isLoading && (
              <div className="flex items-center justify-center p-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-orange-500" />
              </div>
            )}

            {error && (
              <div className="p-4 text-center text-sm text-red-400">
                <p>{error.message}</p>
              </div>
            )}

            {!isLoading && !error && places.length === 0 && (
              <div className="p-4 text-center text-sm text-zinc-400">검색 결과가 없습니다</div>
            )}

            {!isLoading && !error && places.length > 0 && (
              <div className="max-h-80 overflow-y-auto">
                {places.map((place) => (
                  <button
                    key={place.id}
                    onClick={() => handleSelectPlace(place)}
                    type="button"
                    className="flex w-full items-start gap-3 border-b border-zinc-800 p-4 text-left transition-colors last:border-0 hover:bg-zinc-800/50"
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
