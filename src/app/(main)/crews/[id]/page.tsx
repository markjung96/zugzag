"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Users,
  MapPin,
  Calendar,
  Settings,
  BarChart3,
  UserPlus,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

import { mockCrews, mockEvents, currentUser, type MockCrew } from "@/lib/mock";
import { mockCrewMembers } from "@/lib/mock/crews";

export default function CrewDetailPage() {
  const router = useRouter();
  const params = useParams();
  const crewId = params.id as string;

  const [crew, setCrew] = useState<MockCrew | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"events" | "members">("events");

  useEffect(() => {
    const foundCrew = mockCrews.find((c) => c.id === crewId);
    setCrew(foundCrew || null);
    setLoading(false);
  }, [crewId]);

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

  if (!crew) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center">
          <Users className="mx-auto mb-4 h-16 w-16 text-zinc-600" />
          <h2 className="mb-2 text-xl font-bold text-white">크루를 찾을 수 없습니다</h2>
          <p className="mb-6 text-zinc-400">삭제되었거나 존재하지 않는 크루입니다</p>
          <button
            onClick={() => router.push("/crews")}
            className="rounded-xl bg-orange-500 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-600"
          >
            크루 목록으로
          </button>
        </div>
      </div>
    );
  }

  const crewMembers = mockCrewMembers.filter((m) => m.crew_id === crewId);
  const crewEvents = mockEvents.filter((e) => e.crew_id === crewId);
  const isOwner = crewMembers.some((m) => m.user_id === currentUser.id && m.role === "owner");
  const isAdmin = crewMembers.some(
    (m) => m.user_id === currentUser.id && ["owner", "admin"].includes(m.role),
  );
  const isMember = crewMembers.some((m) => m.user_id === currentUser.id);

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

        {/* 크루 헤더 */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <h1 className="mb-2 text-3xl font-bold text-white">{crew.name}</h1>
            {crew.description && <p className="text-zinc-400">{crew.description}</p>}

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-400">
              {crew.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {crew.location}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {crew.member_count || 0}명{crew.max_members && ` / ${crew.max_members}명`}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {crewEvents.length}개 일정
              </div>
            </div>

            {/* 태그 */}
            {crew.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {crew.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg bg-zinc-800/50 px-3 py-1 text-xs font-medium text-zinc-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 액션 버튼 */}
          <div className="flex flex-wrap gap-2">
            {isMember ? (
              <>
                {isAdmin && (
                  <>
                    <Link href={`/crews/${crewId}/stats`}>
                      <button className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm font-medium text-white transition-all hover:border-zinc-700 hover:bg-zinc-800">
                        <BarChart3 className="h-4 w-4" />
                        통계
                      </button>
                    </Link>
                    <button className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm font-medium text-white transition-all hover:border-zinc-700 hover:bg-zinc-800">
                      <Settings className="h-4 w-4" />
                      설정
                    </button>
                  </>
                )}
                <button className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 transition-all hover:bg-red-500/20">
                  <LogOut className="h-4 w-4" />
                  탈퇴
                </button>
              </>
            ) : (
              <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-2 font-medium text-white transition-all hover:from-orange-600 hover:to-orange-700">
                <UserPlus className="h-5 w-5" />
                가입하기
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <div className="mx-auto max-w-6xl">
        {/* 탭 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-1 backdrop-blur-xl">
            <button
              onClick={() => setActiveTab("events")}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "events"
                  ? "bg-orange-500 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              일정 ({crewEvents.length})
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "members"
                  ? "bg-orange-500 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              멤버 ({crewMembers.length})
            </button>
          </div>
        </motion.div>

        {/* 컨텐츠 */}
        {activeTab === "events" ? (
          <EventsList events={crewEvents} />
        ) : (
          <MembersList members={crewMembers} isAdmin={isAdmin} />
        )}
      </div>
    </div>
  );
}

function EventsList({ events }: { events: typeof mockEvents }) {
  if (events.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-12 text-center backdrop-blur-xl"
      >
        <Calendar className="mx-auto mb-4 h-16 w-16 text-zinc-600" />
        <h3 className="mb-2 text-lg font-semibold text-white">등록된 일정이 없습니다</h3>
        <p className="text-sm text-zinc-400">첫 일정을 만들어보세요!</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {events.map((event) => (
        <Link key={event.id} href={`/events/${event.id}`}>
          <motion.div
            whileHover={{ x: 4 }}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-xl transition-all hover:border-orange-500/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="mb-1 font-semibold text-white">{event.title}</h3>
                <p className="mb-2 text-sm text-zinc-400">{event.description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
                  <span>
                    📅{" "}
                    {new Date(event.event_date).toLocaleDateString("ko-KR", {
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span>
                    👥 {event.stats?.attending_count || 0}/{event.total_capacity}
                  </span>
                  {event.phases[0]?.gym && <span>📍 {event.phases[0].gym.name}</span>}
                </div>
              </div>
            </div>
          </motion.div>
        </Link>
      ))}
    </motion.div>
  );
}

function MembersList({ members, isAdmin }: { members: typeof mockCrewMembers; isAdmin: boolean }) {
  const getRoleLabel = (role: string) => {
    switch (role) {
      case "owner":
        return "크루장";
      case "admin":
        return "운영진";
      default:
        return "크루원";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "text-orange-500 bg-orange-500/10";
      case "admin":
        return "text-cyan-400 bg-cyan-400/10";
      default:
        return "text-zinc-400 bg-zinc-800/50";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-cyan-400 font-semibold text-white">
              {member.user.nickname?.[0] || member.user.full_name[0]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium text-white">
                {member.user.nickname || member.user.full_name}
              </div>
              <div
                className={`mt-1 inline-block rounded px-2 py-0.5 text-xs font-medium ${getRoleColor(member.role)}`}
              >
                {getRoleLabel(member.role)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

