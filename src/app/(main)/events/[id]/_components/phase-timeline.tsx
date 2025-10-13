"use client";

import { motion } from "framer-motion";
import { Clock, MapPin, Users, FileText } from "lucide-react";

import type { MockEvent } from "@/lib/mock";

type PhaseTimelineProps = {
  phases: MockEvent["phases"];
};

export function PhaseTimeline({ phases }: PhaseTimelineProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
    >
      <h2 className="mb-6 text-xl font-bold text-white">단계별 일정</h2>

      <div className="space-y-6">
        {phases.map((phase, index) => (
          <div key={phase.id} className="relative">
            {/* 타임라인 연결선 */}
            {index < phases.length - 1 && (
              <div className="absolute top-12 left-6 h-full w-0.5 bg-gradient-to-b from-orange-500 to-cyan-400" />
            )}

            <div className="flex gap-4">
              {/* 단계 번호 */}
              <div className="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-cyan-400 font-bold text-white">
                {phase.phase_number}
              </div>

              {/* 단계 정보 */}
              <div className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <h3 className="mb-3 text-lg font-semibold text-white">{phase.title}</h3>

                <div className="space-y-2">
                  {/* 시간 */}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-zinc-400" />
                    <span className="text-zinc-300">
                      {phase.start_time}
                      {phase.end_time && ` - ${phase.end_time}`}
                    </span>
                  </div>

                  {/* 장소 */}
                  {phase.gym && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-zinc-400" />
                      <div>
                        <div className="text-zinc-300">{phase.gym.name}</div>
                        {phase.gym.address && (
                          <div className="text-xs text-zinc-500">{phase.gym.address}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {phase.location_text && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-zinc-400" />
                      <span className="text-zinc-300">{phase.location_text}</span>
                    </div>
                  )}

                  {/* 정원 */}
                  {phase.capacity && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-zinc-400" />
                      <span className="text-zinc-300">최대 {phase.capacity}명</span>
                    </div>
                  )}

                  {/* 메모 */}
                  {phase.notes && (
                    <div className="flex items-start gap-2 text-sm">
                      <FileText className="mt-0.5 h-4 w-4 text-zinc-400" />
                      <span className="text-zinc-400">{phase.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

