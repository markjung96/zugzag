"use client";

import { MapPin, Search, Loader2, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

// 디바운스 훅 (인라인)
function useDebounce<T>(value: T, delay: number = 300): T {
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

export type Gym = {
  id: string | null;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  website: string | null;
  provider: string | null;
  provider_place_id: string | null;
  distance_m: number | null;
  score: number | null;
  _external?: boolean;
};

type GymSearchInputProps = {
  onSelectAction: (gym: Gym) => void;
  placeholder?: string;
  className?: string;
  initialValue?: string;
  autoFocus?: boolean;
};

export function GymSearchInput({
  onSelectAction,
  placeholder = "암장 검색...",
  className = "",
  initialValue = "",
  autoFocus = false,
}: GymSearchInputProps) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // 사용자 위치 가져오기 (선택)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("위치 정보를 가져올 수 없습니다:", error.message);
        },
      );
    }
  }, []);

  // 검색 실행
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: debouncedQuery,
          limit: "10",
        });

        if (userLocation) {
          params.set("lat", userLocation.lat.toString());
          params.set("lon", userLocation.lon.toString());
        }

        const res = await fetch(`/api/gyms?${params.toString()}`);
        const data = await res.json();

        if (res.ok) {
          setResults(data.results || []);
          setIsOpen(true);
          setSelectedIndex(-1);
        } else {
          console.error("검색 오류:", data.error);
          setResults([]);
        }
      } catch (error) {
        console.error("검색 중 오류:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedQuery, userLocation]);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(results[selectedIndex]);
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
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
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
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 pr-10 pl-10 text-white placeholder-zinc-500 transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
        />

        {/* 로딩/초기화 버튼 */}
        <div className="absolute top-1/2 right-3 -translate-y-1/2">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
          ) : query ? (
            <button
              onClick={handleClear}
              className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* 검색 결과 드롭다운 */}
      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-2 max-h-96 w-full overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl"
        >
          {results.map((gym, idx) => (
            <button
              key={gym.id ?? idx}
              onClick={() => handleSelect(gym)}
              className={`w-full border-b border-zinc-800 px-4 py-3 text-left transition-colors last:border-b-0 ${
                selectedIndex === idx
                  ? "bg-orange-500/10 text-orange-500"
                  : "text-white hover:bg-zinc-800"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="mb-1 font-semibold">{gym.name}</div>
                  {gym.address && (
                    <div className="flex items-center gap-1 text-sm text-zinc-400">
                      <MapPin className="h-3 w-3" />
                      {gym.address}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1">
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

      {/* 결과 없음 */}
      {isOpen && !loading && debouncedQuery && results.length === 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-6 text-center text-zinc-400 shadow-2xl"
        >
          <Search className="mx-auto mb-2 h-8 w-8 text-zinc-600" />
          <p className="text-sm">검색 결과가 없습니다</p>
          <p className="mt-1 text-xs text-zinc-500">다른 키워드로 검색해보세요</p>
        </div>
      )}
    </div>
  );
}
