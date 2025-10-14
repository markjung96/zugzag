"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Trash2,
  Loader2,
  AlertTriangle,
  Globe,
  Lock,
  Users,
  MapPin,
  Image as ImageIcon,
  Link2,
  Copy,
  Plus,
  Check,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

import { useToast } from "@/components/toast-provider";
import type { CrewDetail } from "@/lib/api/crew-helpers";
import type { InviteWithRelations } from "@/lib/api/invite-helpers";
import type { Tables } from "@/lib/supabase/database.types";

import {
  useCrewDetailQuery,
  useUpdateCrewMutation,
  useDeleteCrewMutation,
  useCrewInvitesQuery,
  useCreateInviteMutation,
  useDeleteInviteMutation,
} from "../../_hooks";

type _Crew = CrewDetail;
type _Invite = InviteWithRelations;

export default function CrewSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const crewId = params.id as string;
  const toast = useToast();

  // React Query
  const { data, isLoading, error } = useCrewDetailQuery(crewId);
  const updateCrewMutation = useUpdateCrewMutation();
  const deleteCrewMutation = useDeleteCrewMutation();

  // Invites
  const { data: invitesData, isLoading: invitesLoading } = useCrewInvitesQuery(crewId);
  const createInviteMutation = useCreateInviteMutation();
  const deleteInviteMutation = useDeleteInviteMutation();

  const crew = data?.crew;
  const membership = data?.membership;
  const invites = invitesData?.invites || [];

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    max_members: "",
    is_public: true,
    logo_url: "",
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [deletingInviteId, setDeletingInviteId] = useState<string | null>(null);

  // 초대 코드 생성 옵션
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteOptions, setInviteOptions] = useState({
    maxUses: "",
    expiresInDays: "",
  });

  // Initialize form data when crew loads
  useEffect(() => {
    if (crew) {
      setFormData({
        name: crew.name || "",
        description: crew.description || "",
        location: crew.location || "",
        max_members: crew.max_members?.toString() || "",
        is_public: crew.is_public ?? true,
        logo_url: crew.logo_url || "",
      });
    }
  }, [crew]);

  // 권한 확인: owner만 접근 가능
  const isOwner = membership?.role === "owner";

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !crew) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4">
        <div className="text-center text-red-400">
          <p className="mb-4 text-lg">크루를 찾을 수 없습니다</p>
          <Link
            href="/crews"
            className="rounded-lg bg-orange-500 px-4 py-2 text-white transition hover:bg-orange-600"
          >
            크루 목록으로
          </Link>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-yellow-500" />
          <p className="mb-4 text-lg text-zinc-300">크루장만 설정을 변경할 수 있습니다</p>
          <Link
            href={`/crews/${crewId}`}
            className="rounded-lg bg-orange-500 px-4 py-2 text-white transition hover:bg-orange-600"
          >
            크루로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      const updates: {
        name?: string;
        description?: string;
        location?: string;
        is_public?: boolean;
        max_members?: number;
        logo_url?: string;
      } = {};

      if (formData.name && formData.name !== crew.name) {
        updates.name = formData.name;
      }
      if (formData.description !== crew.description) {
        updates.description = formData.description;
      }
      if (formData.location !== crew.location) {
        updates.location = formData.location;
      }
      if (formData.is_public !== crew.is_public) {
        updates.is_public = formData.is_public;
      }
      if (formData.max_members) {
        const maxMembers = parseInt(formData.max_members, 10);
        if (!isNaN(maxMembers) && maxMembers !== crew.max_members) {
          updates.max_members = maxMembers;
        }
      }
      if (formData.logo_url !== crew.logo_url) {
        updates.logo_url = formData.logo_url;
      }

      if (Object.keys(updates).length === 0) {
        toast.info("변경된 내용이 없습니다");
        return;
      }

      await updateCrewMutation.mutateAsync({ id: crewId, data: updates });
      toast.success("크루 정보가 업데이트되었습니다");
    } catch (err) {
      console.error("Error updating crew:", err);
      toast.error(err instanceof Error ? err.message : "크루 정보 업데이트에 실패했습니다");
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== crew.name) {
      toast.error("크루 이름이 일치하지 않습니다");
      return;
    }

    try {
      await deleteCrewMutation.mutateAsync(crewId);
      toast.success("크루가 삭제되었습니다");
      router.push("/crews");
    } catch (err) {
      console.error("Error deleting crew:", err);
      toast.error(err instanceof Error ? err.message : "크루 삭제에 실패했습니다");
    }
  };

  const handleCreateInvite = async () => {
    try {
      const options: {
        crewId: string;
        max_uses?: number;
        expires_at?: string;
      } = { crewId };

      if (inviteOptions.maxUses) {
        const maxUses = parseInt(inviteOptions.maxUses, 10);
        if (!isNaN(maxUses) && maxUses > 0) {
          options.max_uses = maxUses;
        }
      }

      if (inviteOptions.expiresInDays) {
        const days = parseInt(inviteOptions.expiresInDays, 10);
        if (!isNaN(days) && days > 0) {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + days);
          options.expires_at = expiresAt.toISOString();
        }
      }

      await createInviteMutation.mutateAsync(options);
      toast.success("초대 코드가 생성되었습니다");
      setShowInviteModal(false);
      setInviteOptions({ maxUses: "", expiresInDays: "" });
    } catch (err) {
      console.error("Error creating invite:", err);
      toast.error(err instanceof Error ? err.message : "초대 코드 생성에 실패했습니다");
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    if (!confirm("이 초대 코드를 삭제하시겠습니까?")) return;

    setDeletingInviteId(inviteId);
    try {
      await deleteInviteMutation.mutateAsync({ crewId, inviteId });
      toast.success("초대 코드가 삭제되었습니다");
    } catch (err) {
      console.error("Error deleting invite:", err);
      toast.error(err instanceof Error ? err.message : "초대 코드 삭제에 실패했습니다");
    } finally {
      setDeletingInviteId(null);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      const inviteUrl = `${window.location.origin}/crews/join/${code}`;
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedCode(code);
      toast.success("초대 링크가 복사되었습니다");
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("Error copying code:", err);
      toast.error("복사에 실패했습니다");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isInviteValid = (invite: Tables<"crew_invites">) => {
    const now = new Date();
    if (invite.expires_at && new Date(invite.expires_at) < now) return false;
    if (invite.max_uses && invite.current_uses >= invite.max_uses) return false;
    return true;
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href={`/crews/${crewId}`}
            className="mb-4 inline-flex items-center text-orange-500 transition hover:text-orange-400"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            크루로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-white">크루 설정</h1>
          <p className="mt-2 text-zinc-400">크루 정보를 수정하거나 삭제할 수 있습니다</p>
        </motion.div>

        {/* 크루 정보 수정 섹션 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
        >
          <h2 className="mb-6 text-xl font-bold text-white">기본 정보</h2>

          <div className="space-y-6">
            {/* 크루 이름 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                크루 이름 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
                placeholder="크루 이름을 입력하세요"
                required
              />
            </div>

            {/* 크루 설명 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">크루 설명</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
                placeholder="크루에 대한 설명을 입력하세요"
              />
            </div>

            {/* 위치 */}
            <div>
              <label className="mb-2 flex items-center text-sm font-medium text-zinc-300">
                <MapPin className="mr-1 h-4 w-4" />
                위치
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
                placeholder="예: 서울 강남구"
              />
            </div>

            {/* 정원 */}
            <div>
              <label className="mb-2 flex items-center text-sm font-medium text-zinc-300">
                <Users className="mr-1 h-4 w-4" />
                정원 (최대 인원)
              </label>
              <input
                type="number"
                min="1"
                value={formData.max_members}
                onChange={(e) => setFormData({ ...formData, max_members: e.target.value })}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
                placeholder="미입력 시 제한 없음"
              />
              <p className="mt-1 text-sm text-zinc-500">
                현재 멤버 수: {crew.members?.length || 0}명
              </p>
            </div>

            {/* 로고 URL */}
            <div>
              <label className="mb-2 flex items-center text-sm font-medium text-zinc-300">
                <ImageIcon className="mr-1 h-4 w-4" />
                로고 URL
              </label>
              <input
                type="url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
                placeholder="https://example.com/logo.png"
              />
              {formData.logo_url && (
                <div className="mt-3">
                  <p className="mb-2 text-sm text-zinc-400">미리보기:</p>
                  <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800">
                    <Image
                      src={formData.logo_url}
                      alt="Logo preview"
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 공개 여부 */}
            <div>
              <label className="mb-3 block text-sm font-medium text-zinc-300">크루 공개 설정</label>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_public: true })}
                  className={`flex w-full items-center justify-between rounded-lg border-2 p-4 transition ${
                    formData.is_public
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-zinc-800 bg-zinc-900/30"
                  }`}
                >
                  <div className="flex items-center">
                    <Globe className="mr-3 h-5 w-5 text-orange-400" />
                    <div className="text-left">
                      <div className="font-medium text-white">공개 크루</div>
                      <div className="text-sm text-zinc-400">
                        누구나 자유롭게 가입할 수 있습니다
                      </div>
                    </div>
                  </div>
                  {formData.is_public && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_public: false })}
                  className={`flex w-full items-center justify-between rounded-lg border-2 p-4 transition ${
                    !formData.is_public
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-zinc-800 bg-zinc-900/30"
                  }`}
                >
                  <div className="flex items-center">
                    <Lock className="mr-3 h-5 w-5 text-orange-400" />
                    <div className="text-left">
                      <div className="font-medium text-white">비공개 크루</div>
                      <div className="text-sm text-zinc-400">관리자의 승인이 필요합니다</div>
                    </div>
                  </div>
                  {!formData.is_public && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={updateCrewMutation.isPending}
              className="flex items-center rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updateCrewMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  변경사항 저장
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* 초대 코드 관리 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="flex items-center text-xl font-bold text-white">
                <Link2 className="mr-2 h-5 w-5" />
                초대 코드 관리
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                초대 코드를 생성하여 크루원을 초대할 수 있습니다
              </p>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="mr-2 h-4 w-4" />
              코드 생성
            </button>
          </div>

          {invitesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            </div>
          ) : invites.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-zinc-800 bg-zinc-900/30 p-8 text-center">
              <Link2 className="mx-auto mb-3 h-12 w-12 text-zinc-600" />
              <p className="text-zinc-400">생성된 초대 코드가 없습니다</p>
              <p className="mt-1 text-sm text-zinc-500">
                초대 코드를 생성하여 크루원을 초대해보세요
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {invites.map((invite: Tables<"crew_invites">) => {
                const isValid = isInviteValid(invite);
                const isCopied = copiedCode === invite.invite_code;

                return (
                  <div
                    key={invite.id}
                    className={`rounded-lg border p-4 transition ${
                      isValid
                        ? "border-zinc-800 bg-zinc-900/50"
                        : "border-zinc-800/50 bg-zinc-900/30 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* 초대 코드 */}
                        <div className="mb-2 flex items-center">
                          <code className="rounded bg-orange-500/10 px-3 py-1.5 font-mono text-lg font-bold tracking-wider text-orange-400">
                            {invite.invite_code}
                          </code>
                          {!isValid && (
                            <span className="ml-2 rounded bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
                              만료됨
                            </span>
                          )}
                        </div>

                        {/* 정보 */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-400">
                          <span>
                            사용: {invite.current_uses}
                            {invite.max_uses ? `/${invite.max_uses}` : ""}회
                          </span>
                          {invite.expires_at && <span>만료: {formatDate(invite.expires_at)}</span>}
                          <span>생성: {formatDate(invite.created_at!)}</span>
                        </div>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopyCode(invite.invite_code)}
                          className="rounded-lg border border-zinc-700 bg-zinc-800 p-2 text-zinc-300 transition hover:border-orange-500 hover:bg-zinc-700"
                          title="코드 복사"
                        >
                          {isCopied ? (
                            <Check className="h-4 w-4 text-orange-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteInvite(invite.id)}
                          disabled={deletingInviteId === invite.id}
                          className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          title="코드 삭제"
                        >
                          {deletingInviteId === invite.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* 위험 구역 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border-2 border-red-500/20 bg-red-500/5 p-6 backdrop-blur-xl"
        >
          <div className="flex items-start">
            <AlertTriangle className="mt-1 mr-3 h-6 w-6 flex-shrink-0 text-red-400" />
            <div className="flex-1">
              <h2 className="mb-2 text-xl font-bold text-red-400">위험 구역</h2>
              <p className="mb-4 text-zinc-300">
                크루를 삭제하면 모든 멤버, 일정, 기록이 삭제되며 복구할 수 없습니다.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                크루 삭제
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 초대 코드 생성 모달 */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <h3 className="mb-4 text-xl font-bold text-white">초대 코드 생성</h3>
            <p className="mb-6 text-sm text-zinc-400">
              초대 코드의 사용 제한을 설정할 수 있습니다. 설정하지 않으면 무제한으로 사용됩니다.
            </p>

            <div className="mb-6 space-y-4">
              {/* 최대 사용 횟수 */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  최대 사용 횟수 (선택)
                </label>
                <input
                  type="number"
                  min="1"
                  value={inviteOptions.maxUses}
                  onChange={(e) => setInviteOptions({ ...inviteOptions, maxUses: e.target.value })}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                  placeholder="미입력 시 무제한"
                />
              </div>

              {/* 만료 기간 */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  만료 기간 (일) (선택)
                </label>
                <input
                  type="number"
                  min="1"
                  value={inviteOptions.expiresInDays}
                  onChange={(e) =>
                    setInviteOptions({ ...inviteOptions, expiresInDays: e.target.value })
                  }
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                  placeholder="미입력 시 무제한"
                />
                <p className="mt-1 text-xs text-zinc-500">
                  예: 7일 후 만료되게 하려면 7을 입력하세요
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteOptions({ maxUses: "", expiresInDays: "" });
                }}
                className="flex-1 rounded-lg border border-zinc-700 px-4 py-2 font-medium text-zinc-300 transition hover:bg-zinc-800"
              >
                취소
              </button>
              <button
                onClick={handleCreateInvite}
                disabled={createInviteMutation.isPending}
                className="flex flex-1 items-center justify-center rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {createInviteMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  "생성"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <div className="mb-4 flex items-start">
              <AlertTriangle className="mr-3 h-8 w-8 flex-shrink-0 text-red-400" />
              <div>
                <h3 className="mb-1 text-xl font-bold text-white">크루 삭제 확인</h3>
                <p className="text-zinc-400">이 작업은 되돌릴 수 없습니다</p>
              </div>
            </div>

            <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
              <p className="mb-2 text-sm text-zinc-300">다음 항목이 영구적으로 삭제됩니다:</p>
              <ul className="list-inside list-disc space-y-1 text-sm text-zinc-400">
                <li>크루의 모든 정보</li>
                <li>모든 멤버 기록</li>
                <li>모든 일정 및 출석 기록</li>
                <li>활동 로그</li>
              </ul>
            </div>

            <p className="mb-2 text-sm text-zinc-300">
              계속하려면 크루 이름{" "}
              <span className="font-bold text-white">&quot;{crew.name}&quot;</span>을 입력하세요:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="mb-6 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none"
              placeholder={crew.name}
              autoFocus
            />

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                }}
                className="flex-1 rounded-lg bg-zinc-700 px-4 py-2 font-medium text-white transition hover:bg-zinc-600"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirmText !== crew.name || deleteCrewMutation.isPending}
                className="flex flex-1 items-center justify-center rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleteCrewMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    삭제 중...
                  </>
                ) : (
                  "삭제"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
