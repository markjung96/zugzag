"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Edit,
  X as XIcon,
  Share2,
  MoreVertical,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

import { mockEvents, currentUser, type MockEvent } from "@/lib/mock";
import { getAttendancesByEventId } from "@/lib/mock/attendances";

import { AttendanceSection } from "./_components/attendance-section";
import { EventMap } from "./_components/event-map";
import { PhaseTimeline } from "./_components/phase-timeline";
import { RsvpButton } from "./_components/rsvp-button";

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<MockEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    // Mock 데이터에서 이벤트 찾기
    const foundEvent = mockEvents.find((e) => e.id === eventId);
    setEvent(foundEvent || null);
    setLoading(false);
  }, [eventId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-orange-500" />
          <p className="text-sm text-zinc-400">일정을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-zinc-600" />
          <h2 className="mb-2 text-xl font-bold text-white">일정을 찾을 수 없습니다</h2>
          <p className="mb-6 text-zinc-400">삭제되었거나 존재하지 않는 일정입니다</p>
          <button
            onClick={() => router.push("/schedule")}
            className="rounded-xl bg-orange-500 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-600"
          >
            일정 목록으로
          </button>
        </div>
      </div>
    );
  }

  const isPast = new Date(event.event_date) < new Date();
  const isCreator = event.created_by === currentUser.id;
  const attendances = getAttendancesByEventId(eventId);
  const userAttendance = attendances.find((a) => a.user_id === currentUser.id);

  const handleEdit = () => {
    router.push(`/events/${eventId}/edit`);
  };

  const handleCancel = async () => {
    if (!confirm("정말 이 일정을 취소하시겠습니까?")) return;

    // TODO: API 호출
    alert("일정이 취소되었습니다");
    router.push("/schedule");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description || "",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("링크가 복사되었습니다");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-4 pb-20 md:p-8">
      {/* 헤더 */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
            뒤로가기
          </button>

          <div className="flex items-center gap-2">
            {/* 공유 버튼 */}
            <button
              onClick={handleShare}
              className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-2 text-zinc-400 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
            >
              <Share2 className="h-5 w-5" />
            </button>

            {/* 관리 메뉴 (크루장만) */}
            {isCreator && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-2 text-zinc-400 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>

                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-12 right-0 z-20 w-48 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl"
                    >
                      <button
                        onClick={handleEdit}
                        className="flex w-full items-center gap-2 px-4 py-3 text-sm text-white transition-colors hover:bg-zinc-800"
                      >
                        <Edit className="h-4 w-4" />
                        일정 수정
                      </button>
                      <button
                        onClick={() => router.push(`/events/${eventId}/check-in`)}
                        className="flex w-full items-center gap-2 px-4 py-3 text-sm text-white transition-colors hover:bg-zinc-800"
                      >
                        <UserCheck className="h-4 w-4" />
                        체크인
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex w-full items-center gap-2 border-t border-zinc-800 px-4 py-3 text-sm text-red-500 transition-colors hover:bg-zinc-800"
                      >
                        <XIcon className="h-4 w-4" />
                        일정 취소
                      </button>
                    </motion.div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 상태 뱃지 */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {event.is_cancelled && (
            <span className="rounded-lg bg-red-500/10 px-3 py-1 text-sm font-semibold text-red-500">
              취소됨
            </span>
          )}
          {isPast && !event.is_cancelled && (
            <span className="rounded-lg bg-zinc-700/50 px-3 py-1 text-sm font-semibold text-zinc-400">
              완료
            </span>
          )}
          {event.visibility === "public" && (
            <span className="rounded-lg bg-cyan-400/10 px-3 py-1 text-sm font-semibold text-cyan-400">
              공개
            </span>
          )}
        </div>

        {/* 제목 & 크루 */}
        <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">{event.title}</h1>
        <p className="text-lg text-orange-500">{event.crew.name}</p>
      </motion.div>

      <div className="mx-auto max-w-5xl space-y-6">
        {/* 기본 정보 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
        >
          {event.description && <p className="mb-6 text-zinc-300">{event.description}</p>}

          <div className="grid gap-4 md:grid-cols-2">
            {/* 날짜 */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-orange-500/10 p-2">
                <Calendar className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <div className="text-sm text-zinc-400">날짜</div>
                <div className="font-semibold text-white">
                  {new Date(event.event_date).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    weekday: "long",
                  })}
                </div>
              </div>
            </div>

            {/* 시간 */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-cyan-400/10 p-2">
                <Clock className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <div className="text-sm text-zinc-400">시간</div>
                <div className="font-semibold text-white">
                  {event.phases[0].start_time}
                  {event.phases[0].end_time && ` - ${event.phases[0].end_time}`}
                </div>
              </div>
            </div>

            {/* 정원 */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-purple-500/10 p-2">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <div className="text-sm text-zinc-400">정원</div>
                <div className="font-semibold text-white">
                  {event.stats?.attending_count || 0} / {event.total_capacity}명
                  {event.stats && event.stats.waitlist_count > 0 && (
                    <span className="ml-2 text-sm text-yellow-500">
                      (대기 {event.stats.waitlist_count})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 장소 */}
            {event.phases[0].gym && (
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-green-500/10 p-2">
                  <MapPin className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <div className="text-sm text-zinc-400">장소</div>
                  <div className="font-semibold text-white">{event.phases[0].gym.name}</div>
                  {event.phases[0].gym.address && (
                    <div className="text-sm text-zinc-500">{event.phases[0].gym.address}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 태그 */}
          {event.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2 border-t border-zinc-800 pt-6">
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-zinc-800/50 px-3 py-1 text-sm font-medium text-zinc-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* 단계별 일정 (1차/2차) */}
        {event.phases.length > 0 && <PhaseTimeline phases={event.phases} />}

        {/* 지도 */}
        {event.phases[0].gym && <EventMap gym={event.phases[0].gym} />}

        {/* 참석자 목록 */}
        <AttendanceSection
          eventId={eventId}
          attendances={attendances}
          totalCapacity={event.total_capacity}
          isCreator={isCreator}
        />
      </div>

      {/* 하단 고정 RSVP 버튼 */}
      {!isPast && !event.is_cancelled && (
        <RsvpButton
          eventId={eventId}
          userAttendance={userAttendance}
          isFull={event.stats ? event.stats.attending_count >= event.total_capacity : false}
          allowWaitlist={event.allow_waitlist}
        />
      )}
    </div>
  );
}

