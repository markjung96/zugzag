"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  UserCheck,
  Users,
  CheckCircle,
  Clock,
  Search,
  AlertCircle,
  Ban,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

import { mockEvents, type MockEvent, type MockAttendance } from "@/lib/mock";
import { getAttendancesByEventId } from "@/lib/mock/attendances";

export default function CheckInPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<MockEvent | null>(null);
  const [attendances, setAttendances] = useState<MockAttendance[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const foundEvent = mockEvents.find((e) => e.id === eventId);
    if (!foundEvent) {
      alert("일정을 찾을 수 없습니다");
      router.push("/schedule");
      return;
    }

    setEvent(foundEvent);
    setAttendances(getAttendancesByEventId(eventId));
    setLoading(false);
  }, [eventId, router]);

  const handleCheckIn = (attendanceId: string) => {
    // TODO: API 호출
    console.log("Check in:", attendanceId);
    alert("체크인 되었습니다");
    // 상태 업데이트
  };

  const handleNoShow = (attendanceId: string) => {
    if (!confirm("노쇼 처리하시겠습니까?")) return;
    // TODO: API 호출
    console.log("No show:", attendanceId);
    alert("노쇼 처리되었습니다");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-orange-500" />
          <p className="text-sm text-zinc-400">불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const attendingList = attendances.filter((a) => a.status === "attending");
  const checkedInList = attendingList.filter((a) => a.checked_in_at);
  const filteredAttendances = attendingList.filter(
    (a) =>
      a.user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.user.nickname?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      {/* 헤더 */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-zinc-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
          뒤로가기
        </button>
        <h1 className="text-3xl font-bold text-white">체크인</h1>
        <p className="mt-2 text-zinc-400">{event.title}</p>
      </motion.div>

      <div className="mx-auto max-w-4xl space-y-6">
        {/* 통계 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 md:grid-cols-3"
        >
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl">
            <div className="mb-2 flex items-center gap-2 text-zinc-400">
              <Users className="h-5 w-5" />
              <span className="text-sm font-medium">참석 예정</span>
            </div>
            <div className="text-3xl font-bold text-white">{attendingList.length}명</div>
          </div>

          <div className="rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-green-500/5 p-6 backdrop-blur-xl">
            <div className="mb-2 flex items-center gap-2 text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">체크인 완료</span>
            </div>
            <div className="text-3xl font-bold text-white">{checkedInList.length}명</div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl">
            <div className="mb-2 flex items-center gap-2 text-zinc-400">
              <Clock className="h-5 w-5" />
              <span className="text-sm font-medium">대기 중</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {attendingList.length - checkedInList.length}명
            </div>
          </div>
        </motion.div>

        {/* 검색 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-xl"
        >
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="이름 또는 닉네임으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 pr-4 pl-10 text-white placeholder-zinc-500 transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
            />
          </div>
        </motion.div>

        {/* 참석자 목록 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
        >
          <h2 className="mb-4 text-xl font-bold text-white">참석자 목록</h2>

          {filteredAttendances.length === 0 ? (
            <div className="py-12 text-center">
              <AlertCircle className="mx-auto mb-3 h-12 w-12 text-zinc-600" />
              <p className="text-sm text-zinc-400">
                {searchQuery ? "검색 결과가 없습니다" : "참석 예정자가 없습니다"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAttendances.map((attendance) => (
                <motion.div
                  key={attendance.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
                    attendance.checked_in_at
                      ? "border-green-500/30 bg-green-500/10"
                      : "border-zinc-800 bg-zinc-900/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* 아바타 */}
                    <div className="relative">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-cyan-400 font-semibold text-white">
                        {attendance.user.nickname?.[0] || attendance.user.full_name[0]}
                      </div>
                      {attendance.checked_in_at && (
                        <div className="absolute -right-1 -bottom-1 rounded-full bg-green-500 p-1">
                          <CheckCircle className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>

                    {/* 사용자 정보 */}
                    <div>
                      <div className="font-semibold text-white">
                        {attendance.user.nickname || attendance.user.full_name}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        {attendance.user.climbing_level && (
                          <span>{attendance.user.climbing_level}</span>
                        )}
                        {attendance.checked_in_at && (
                          <>
                            <span>·</span>
                            <span className="text-green-500">
                              {new Date(attendance.checked_in_at).toLocaleTimeString("ko-KR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              체크인
                            </span>
                          </>
                        )}
                      </div>
                      {attendance.user_note && (
                        <div className="mt-1 text-xs text-zinc-500">{attendance.user_note}</div>
                      )}
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex items-center gap-2">
                    {attendance.checked_in_at ? (
                      <div className="flex items-center gap-1 rounded-lg bg-green-500/20 px-3 py-1.5 text-sm font-medium text-green-500">
                        <CheckCircle className="h-4 w-4" />
                        완료
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleCheckIn(attendance.id)}
                          className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-orange-600 hover:to-orange-700"
                        >
                          <UserCheck className="h-4 w-4" />
                          체크인
                        </button>
                        <button
                          onClick={() => handleNoShow(attendance.id)}
                          className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-red-500 transition-all hover:bg-red-500/20"
                          title="노쇼 처리"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

