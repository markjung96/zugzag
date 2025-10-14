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
  Loader2,
  UserCheck,
  Shield,
  Trash2,
  CheckCircle,
  XCircle,
  Link2,
  Plus,
  Copy,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/components/toast-provider";
import type { CrewDetail } from "@/lib/api/crew-helpers";
import type { Tables } from "@/lib/supabase/database.types";

import {
  useCrewDetailQuery,
  useJoinCrewMutation,
  useLeaveCrewMutation,
  useJoinRequestMutation,
  useJoinRequestsQuery,
  useApproveJoinRequestMutation,
  useRejectJoinRequestMutation,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
  useCrewInvitesQuery,
  useCreateInviteMutation,
  useDeleteInviteMutation,
} from "../_hooks";

type Crew = CrewDetail;
type _Membership = Tables<"crew_members">;

export default function CrewDetailPage() {
  const router = useRouter();
  const params = useParams();
  const crewId = params.id as string;
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<"events" | "members" | "management">("events");

  // React Query로 크루 상세 조회
  const { data, isLoading, error } = useCrewDetailQuery(crewId);

  // Mutations
  const joinCrewMutation = useJoinCrewMutation();
  const leaveCrewMutation = useLeaveCrewMutation();
  const joinRequestMutation = useJoinRequestMutation();

  const crew = data?.crew;
  const membership = data?.membership;

  const handleJoinCrew = async () => {
    try {
      // 공개 크루는 바로 가입, 비공개 크루는 신청
      if (crew?.is_public) {
        await joinCrewMutation.mutateAsync(crewId);
        toast.success("크루에 가입되었습니다!");
      } else {
        await joinRequestMutation.mutateAsync({ crewId });
        toast.success("가입 신청이 완료되었습니다. 관리자의 승인을 기다려주세요.");
      }
    } catch (err) {
      console.error("Error joining crew:", err);

      // 온보딩이 필요한 경우
      if (err instanceof Error && err.message.includes("ONBOARDING_REQUIRED")) {
        toast.error("먼저 프로필을 완성해주세요");
        router.push("/onboarding");
        return;
      }

      toast.error(err instanceof Error ? err.message : "크루 가입에 실패했습니다");
    }
  };

  const handleLeaveCrew = async () => {
    if (!confirm("정말 크루를 탈퇴하시겠습니까?")) {
      return;
    }

    try {
      await leaveCrewMutation.mutateAsync(crewId);
      toast.success("크루를 탈퇴했습니다");
      router.push("/crews");
    } catch (err) {
      console.error("Error leaving crew:", err);
      toast.error(err instanceof Error ? err.message : "크루 탈퇴에 실패했습니다");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-orange-500" />
          <p className="text-sm text-zinc-400">불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !crew) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center">
          <Users className="mx-auto mb-4 h-16 w-16 text-zinc-600" />
          <h2 className="mb-2 text-xl font-bold text-white">
            {error instanceof Error ? error.message : "크루를 찾을 수 없습니다"}
          </h2>
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

  const crewMembers =
    crew.members?.filter((m: NonNullable<typeof crew.members>[number]) => m.is_active) || [];
  const isOwner = membership?.role === "owner";
  const isAdmin = membership && ["owner", "admin"].includes(membership.role);
  const isMember = !!membership;
  const canViewMembers = crew.is_public || isMember; // 공개 크루이거나 멤버인 경우에만 멤버 리스트 볼 수 있음

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
                {canViewMembers
                  ? `${crewMembers.length}명${crew.max_members ? ` / ${crew.max_members}명` : ""}`
                  : "비공개"}
              </div>
              {!crew.is_public && (
                <div className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs">비공개</div>
              )}
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex flex-wrap gap-2">
            {isMember ? (
              <>
                {isAdmin && (
                  <Link href={`/crews/${crewId}/stats`}>
                    <button className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm font-medium text-white transition-all hover:border-zinc-700 hover:bg-zinc-800">
                      <BarChart3 className="h-4 w-4" />
                      통계
                    </button>
                  </Link>
                )}
                {isOwner && (
                  <Link href={`/crews/${crewId}/settings`}>
                    <button className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm font-medium text-white transition-all hover:border-zinc-700 hover:bg-zinc-800">
                      <Settings className="h-4 w-4" />
                      설정
                    </button>
                  </Link>
                )}
                <button
                  onClick={handleLeaveCrew}
                  disabled={leaveCrewMutation.isPending}
                  className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 transition-all hover:bg-red-500/20 disabled:opacity-50"
                >
                  {leaveCrewMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  탈퇴
                </button>
              </>
            ) : (
              <button
                onClick={handleJoinCrew}
                disabled={joinCrewMutation.isPending || joinRequestMutation.isPending}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-2 font-medium text-white transition-all hover:from-orange-600 hover:to-orange-700 disabled:opacity-50"
              >
                {joinCrewMutation.isPending || joinRequestMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <UserPlus className="h-5 w-5" />
                )}
                {joinCrewMutation.isPending || joinRequestMutation.isPending
                  ? "처리 중..."
                  : crew?.is_public
                    ? "가입하기"
                    : "가입 신청"}
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
              일정 (0)
            </button>
            {canViewMembers && (
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
            )}
            {isAdmin && (
              <button
                onClick={() => setActiveTab("management")}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === "management"
                    ? "bg-orange-500 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                관리
              </button>
            )}
          </div>
        </motion.div>

        {/* 컨텐츠 */}
        {activeTab === "events" ? (
          <EventsList />
        ) : activeTab === "members" ? (
          canViewMembers ? (
            <MembersList members={crewMembers} />
          ) : (
            <PrivateMembersMessage />
          )
        ) : (
          <ManagementSection crewId={crewId} isOwner={!!isOwner} />
        )}
      </div>
    </div>
  );
}

function EventsList() {
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

function PrivateMembersMessage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-12 text-center backdrop-blur-xl"
    >
      <Users className="mx-auto mb-4 h-16 w-16 text-zinc-600" />
      <h3 className="mb-2 text-lg font-semibold text-white">비공개 크루입니다</h3>
      <p className="text-sm text-zinc-400">멤버 정보는 크루에 가입한 후 확인할 수 있습니다</p>
    </motion.div>
  );
}

function MembersList({ members }: { members: Crew["members"]; _isAdmin?: boolean }) {
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

  if (!members || members.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-12 text-center backdrop-blur-xl"
      >
        <Users className="mx-auto mb-4 h-16 w-16 text-zinc-600" />
        <h3 className="mb-2 text-lg font-semibold text-white">멤버가 없습니다</h3>
      </motion.div>
    );
  }

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
              {member.user.nickname?.[0] || member.user.full_name?.[0] || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium text-white">
                {member.user.nickname || member.user.full_name || "Unknown"}
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

/**
 * 관리 섹션 컴포넌트 (관리자 전용)
 */
function ManagementSection({ crewId, isOwner }: { crewId: string; isOwner: boolean }) {
  const toast = useToast();

  // 타입 정의 (DB types 기반)
  type JoinRequest = Tables<"crew_join_requests"> & {
    user: {
      id: string;
      full_name: string | null;
      avatar_url: string | null;
      nickname: string | null;
      climbing_level: string | null;
      bio: string | null;
    };
    reviewer?: {
      id: string;
      full_name: string | null;
      nickname: string | null;
    } | null;
  };

  type CrewMember = {
    id: string;
    user_id: string;
    role: string;
    is_active: boolean | null;
    joined_at: string | null;
    user: {
      id: string;
      full_name: string | null;
      avatar_url: string | null;
      nickname: string | null;
      climbing_level: string | null;
    };
  };

  // 초대 링크 관련 state
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // React Query Hooks
  const { data: joinRequestsData, isLoading: loadingRequests } = useJoinRequestsQuery({
    crewId,
    status: "pending",
  });
  const { data: crewData } = useCrewDetailQuery(crewId);
  const { data: invitesData, isLoading: loadingInvites } = useCrewInvitesQuery(crewId);

  const approveMutation = useApproveJoinRequestMutation();
  const rejectMutation = useRejectJoinRequestMutation();
  const updateRoleMutation = useUpdateMemberRoleMutation();
  const removeMemberMutation = useRemoveMemberMutation();
  const createInviteMutation = useCreateInviteMutation();
  const deleteInviteMutation = useDeleteInviteMutation();

  const joinRequests: JoinRequest[] = joinRequestsData?.requests || [];
  const crewMembers: CrewMember[] =
    crewData?.crew?.members?.filter((m: CrewMember) => m.is_active) || [];
  const invites = invitesData?.invites || [];

  const handleApprove = async (requestId: string) => {
    try {
      await approveMutation.mutateAsync({ crewId, requestId });
      toast.success("가입을 승인했습니다!");
    } catch (err) {
      console.error("Error approving request:", err);
      toast.error(err instanceof Error ? err.message : "승인에 실패했습니다");
    }
  };

  const handleReject = async (requestId: string) => {
    if (!confirm("정말 거절하시겠습니까?")) return;

    try {
      await rejectMutation.mutateAsync({ crewId, requestId });
      toast.success("가입 신청을 거절했습니다");
    } catch (err) {
      console.error("Error rejecting request:", err);
      toast.error(err instanceof Error ? err.message : "거절에 실패했습니다");
    }
  };

  const handleRoleChange = async (memberId: string, newRole: "owner" | "admin" | "member") => {
    if (!confirm(`정말 역할을 변경하시겠습니까?`)) return;

    try {
      await updateRoleMutation.mutateAsync({ crewId, memberId, role: newRole });
      toast.success("역할을 변경했습니다");
    } catch (err) {
      console.error("Error updating role:", err);
      toast.error(err instanceof Error ? err.message : "역할 변경에 실패했습니다");
    }
  };

  const handleRemoveMember = async (memberId: string, userName: string) => {
    if (!confirm(`정말 ${userName}님을 크루에서 내보내시겠습니까?`)) return;

    try {
      await removeMemberMutation.mutateAsync({ crewId, memberId });
      toast.success("멤버를 내보냈습니다");
    } catch (err) {
      console.error("Error removing member:", err);
      toast.error(err instanceof Error ? err.message : "멤버 제거에 실패했습니다");
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "text-orange-500 bg-orange-500/10 border-orange-500/30";
      case "admin":
        return "text-cyan-400 bg-cyan-400/10 border-cyan-400/30";
      default:
        return "text-zinc-400 bg-zinc-800/50 border-zinc-700";
    }
  };

  // 초대 링크 생성
  const handleCreateInvite = async () => {
    try {
      await createInviteMutation.mutateAsync({ crewId });
      toast.success("초대 링크가 생성되었습니다");
    } catch (err) {
      console.error("Error creating invite:", err);
      toast.error(err instanceof Error ? err.message : "초대 링크 생성에 실패했습니다");
    }
  };

  // 초대 코드 복사
  const handleCopyCode = (code: string) => {
    const inviteUrl = `${window.location.origin}/crews/join/${code}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedCode(code);
    toast.success("초대 링크가 복사되었습니다");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // 초대 링크 삭제
  const handleDeleteInvite = async (inviteId: string) => {
    if (!confirm("이 초대 링크를 삭제하시겠습니까?")) return;

    try {
      await deleteInviteMutation.mutateAsync({ crewId, inviteId });
      toast.success("초대 링크가 삭제되었습니다");
    } catch (err) {
      console.error("Error deleting invite:", err);
      toast.error(err instanceof Error ? err.message : "초대 링크 삭제에 실패했습니다");
    }
  };

  return (
    <div className="space-y-6">
      {/* 초대 링크 관리 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="h-6 w-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">초대 링크 관리</h2>
          </div>
          <button
            onClick={handleCreateInvite}
            disabled={createInviteMutation.isPending}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-orange-500/30 disabled:opacity-50"
          >
            {createInviteMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            링크 생성
          </button>
        </div>

        {loadingInvites ? (
          <div className="py-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-zinc-600" />
          </div>
        ) : invites.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
            <Link2 className="mx-auto mb-3 h-12 w-12 text-zinc-600" />
            <p className="mb-2 text-sm font-medium text-white">초대 링크가 없습니다</p>
            <p className="text-xs text-zinc-400">초대 링크를 생성하여 크루원을 초대하세요</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invites.map((invite: Tables<"crew_invites">) => {
              const isExpired = invite.expires_at
                ? new Date(invite.expires_at) < new Date()
                : false;
              const isMaxedOut = invite.max_uses ? invite.current_uses >= invite.max_uses : false;
              const isInactive = isExpired || isMaxedOut;

              return (
                <div
                  key={invite.id}
                  className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
                    isInactive
                      ? "border-zinc-800 bg-zinc-900/30 opacity-60"
                      : "border-zinc-700 bg-zinc-900/50"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <code className="rounded bg-zinc-800 px-2 py-1 font-mono text-sm text-cyan-400">
                        {invite.invite_code}
                      </code>
                      {isInactive && (
                        <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-500">
                          {isExpired ? "만료됨" : "사용 완료"}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-zinc-400">
                      <span>
                        사용: {invite.current_uses}
                        {invite.max_uses ? ` / ${invite.max_uses}` : " / 무제한"}
                      </span>
                      {invite.expires_at ? (
                        <span>
                          만료:{" "}
                          {new Date(invite.expires_at).toLocaleDateString("ko-KR", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      ) : (
                        <span>만료 없음</span>
                      )}
                      {invite.created_at && (
                        <span>
                          생성:{" "}
                          {new Date(invite.created_at).toLocaleDateString("ko-KR", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyCode(invite.invite_code)}
                      disabled={isInactive}
                      className="flex items-center gap-1 rounded-lg bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-400 transition-all hover:bg-cyan-500/20 disabled:opacity-50"
                    >
                      {copiedCode === invite.invite_code ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          복사됨
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          복사
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteInvite(invite.id)}
                      disabled={deleteInviteMutation.isPending}
                      className="flex items-center gap-1 rounded-lg bg-red-500/10 p-2 text-red-500 transition-all hover:bg-red-500/20 disabled:opacity-50"
                      title="삭제"
                    >
                      {deleteInviteMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* 가입 대기자 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
      >
        <div className="mb-4 flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-orange-500" />
          <h2 className="text-xl font-bold text-white">가입 대기자</h2>
          {joinRequests.length > 0 && (
            <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">
              {joinRequests.length}
            </span>
          )}
        </div>

        {loadingRequests ? (
          <div className="py-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-zinc-600" />
          </div>
        ) : joinRequests.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
            <UserCheck className="mx-auto mb-3 h-12 w-12 text-zinc-600" />
            <p className="text-sm text-zinc-400">대기 중인 가입 신청이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {joinRequests.map((request) => (
              <div
                key={request.id}
                className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-cyan-400 font-semibold text-white">
                    {request.user.nickname?.[0] || request.user.full_name?.[0] || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-white">
                      {request.user.nickname || request.user.full_name || "Unknown"}
                    </div>
                    {request.user.climbing_level && (
                      <div className="text-xs text-zinc-400">{request.user.climbing_level}</div>
                    )}
                    {request.message && (
                      <div className="mt-1 text-sm text-zinc-300">💬 {request.message}</div>
                    )}
                    <div className="mt-1 text-xs text-zinc-500">
                      {new Date(request.created_at || "").toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(request.id)}
                    disabled={approveMutation.isPending}
                    className="flex items-center gap-1 rounded-lg bg-green-500/10 px-3 py-2 text-sm font-medium text-green-500 transition-all hover:bg-green-500/20 disabled:opacity-50"
                  >
                    {approveMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    승인
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    disabled={rejectMutation.isPending}
                    className="flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-500 transition-all hover:bg-red-500/20 disabled:opacity-50"
                  >
                    {rejectMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    거절
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* 멤버 관리 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
      >
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-6 w-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">멤버 관리</h2>
        </div>

        {crewMembers.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
            <Users className="mx-auto mb-3 h-12 w-12 text-zinc-600" />
            <p className="text-sm text-zinc-400">멤버가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {crewMembers.map((member) => (
              <div
                key={member.id}
                className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-cyan-400 font-semibold text-white">
                    {member.user.nickname?.[0] || member.user.full_name?.[0] || "U"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-white">
                      {member.user.nickname || member.user.full_name || "Unknown"}
                    </div>
                    {member.user.climbing_level && (
                      <div className="text-xs text-zinc-400">{member.user.climbing_level}</div>
                    )}
                    <div className="mt-1 text-xs text-zinc-500">
                      가입일:{" "}
                      {new Date(member.joined_at || "").toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* 역할 변경 드롭다운 */}
                  <select
                    value={member.role}
                    onChange={(e) =>
                      handleRoleChange(member.id, e.target.value as "owner" | "admin" | "member")
                    }
                    disabled={
                      member.role === "owner" ||
                      (!isOwner && member.role === "admin") ||
                      updateRoleMutation.isPending
                    }
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 ${getRoleColor(member.role)}`}
                  >
                    {isOwner && <option value="owner">크루장</option>}
                    <option value="admin">운영진</option>
                    <option value="member">크루원</option>
                  </select>

                  {/* 강제 탈퇴 버튼 */}
                  {member.role !== "owner" && (
                    <button
                      onClick={() =>
                        handleRemoveMember(
                          member.id,
                          member.user.nickname || member.user.full_name || "Unknown",
                        )
                      }
                      disabled={removeMemberMutation.isPending}
                      className="flex items-center gap-1 rounded-lg bg-red-500/10 p-2 text-red-500 transition-all hover:bg-red-500/20 disabled:opacity-50"
                      title="멤버 내보내기"
                    >
                      {removeMemberMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
