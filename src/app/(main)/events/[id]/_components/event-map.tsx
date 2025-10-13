"use client";

import { motion } from "framer-motion";
import { MapPin, ExternalLink, Navigation } from "lucide-react";

type EventMapProps = {
  gym: {
    id: string;
    name: string;
    address: string;
  };
};

export function EventMap({ gym }: EventMapProps) {
  const handleOpenMap = () => {
    // 카카오맵 또는 네이버맵으로 열기
    const query = encodeURIComponent(`${gym.name} ${gym.address}`);
    window.open(`https://map.kakao.com/link/search/${query}`, "_blank");
  };

  const handleGetDirections = () => {
    // 길찾기
    const query = encodeURIComponent(gym.address);
    window.open(`https://map.kakao.com/link/to/${query}`, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold text-white">
          <MapPin className="h-6 w-6 text-green-500" />
          장소
        </h2>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{gym.name}</h3>
        <p className="text-sm text-zinc-400">{gym.address}</p>
      </div>

      {/* 지도 placeholder - 실제로는 카카오맵이나 네이버맵 embed */}
      <div className="mb-4 aspect-video overflow-hidden rounded-xl bg-zinc-800">
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <MapPin className="mx-auto mb-2 h-12 w-12 text-zinc-600" />
            <p className="text-sm text-zinc-500">지도가 여기에 표시됩니다</p>
            <p className="mt-1 text-xs text-zinc-600">카카오맵 또는 네이버맵 연동 필요</p>
          </div>
        </div>
      </div>

      {/* 버튼들 */}
      <div className="flex gap-2">
        <button
          onClick={handleOpenMap}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 text-sm font-medium text-white transition-all hover:border-zinc-700 hover:bg-zinc-800"
        >
          <ExternalLink className="h-4 w-4" />
          지도에서 보기
        </button>
        <button
          onClick={handleGetDirections}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-3 text-sm font-medium text-white transition-all hover:from-orange-600 hover:to-orange-700"
        >
          <Navigation className="h-4 w-4" />
          길찾기
        </button>
      </div>
    </motion.div>
  );
}

