"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Filter,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";

import { useToast } from "@/components/toast-provider";
import type { PendingRouteWithGym } from "@/lib/api/admin-helpers";

type PendingRoute = PendingRouteWithGym;

export default function PendingRoutesPage() {
  const toast = useToast();
  const [routes, setRoutes] = useState<PendingRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<PendingRoute | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [_showEditModal, _setShowEditModal] = useState(false);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: selectedStatus,
        limit: limit.toString(),
        offset: offset.toString(),
      });

      const response = await fetch(`/api/admin/pending-routes?${params}`);
      const data = await response.json();

      if (response.ok) {
        setRoutes(data.routes);
        setTotal(data.total);
      } else {
        console.error("Failed to fetch routes:", data.error);
      }
    } catch (error) {
      console.error("Error fetching routes:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, offset, limit]);

  // 데이터 로드
  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  // 승인
  const handleApprove = async (id: string) => {
    if (!confirm("이 루트를 승인하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/admin/pending-routes/${id}/approve`, {
        method: "POST",
      });

      if (response.ok) {
        toast.success("승인되었습니다!");
        fetchRoutes();
        setShowDetailModal(false);
      } else {
        const data = await response.json();
        toast.error(`승인 실패: ${data.error}`);
      }
    } catch (error) {
      console.error("Error approving route:", error);
      toast.error("승인 중 오류가 발생했습니다.");
    }
  };

  // 거부
  const handleReject = async (id: string) => {
    const reason = prompt("거부 사유를 입력하세요 (선택):");
    if (reason === null) return; // 취소

    try {
      const response = await fetch(`/api/admin/pending-routes/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        toast.success("거부되었습니다.");
        fetchRoutes();
        setShowDetailModal(false);
      } else {
        const data = await response.json();
        toast.error(`거부 실패: ${data.error}`);
      }
    } catch (error) {
      console.error("Error rejecting route:", error);
      toast.error("거부 중 오류가 발생했습니다.");
    }
  };

  // 삭제
  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;

    try {
      const response = await fetch(`/api/admin/pending-routes/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("삭제되었습니다.");
        fetchRoutes();
        setShowDetailModal(false);
      } else {
        const data = await response.json();
        toast.error(`삭제 실패: ${data.error}`);
      }
    } catch (error) {
      console.error("Error deleting route:", error);
      toast.error("삭제 중 오류가 발생했습니다.");
    }
  };

  // 상태별 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-500 bg-yellow-500/10";
      case "needs_review":
        return "text-orange-500 bg-orange-500/10";
      case "approved":
        return "text-green-500 bg-green-500/10";
      case "rejected":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-zinc-500 bg-zinc-500/10";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "검토 대기";
      case "needs_review":
        return "우선 검토";
      case "approved":
        return "승인됨";
      case "rejected":
        return "거부됨";
      default:
        return status;
    }
  };

  // 신뢰도 색상
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-500";
    if (confidence >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  // 필터링된 루트
  const filteredRoutes = routes.filter((route) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      route.gym?.name.toLowerCase().includes(query) ||
      route.parsed_setter_name?.toLowerCase().includes(query) ||
      route.parsed_difficulty?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white">검토 대기 루트</h1>
          <p className="text-zinc-400">Instagram에서 수집된 루트를 검토하고 승인하세요</p>
        </div>

        {/* 필터 및 검색 */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* 상태 필터 */}
          <div className="flex gap-2 overflow-x-auto">
            {[
              { value: "pending", label: "검토 대기", icon: Clock },
              { value: "needs_review", label: "우선 검토", icon: AlertCircle },
              { value: "approved", label: "승인됨", icon: CheckCircle },
              { value: "rejected", label: "거부됨", icon: XCircle },
              { value: "all", label: "전체", icon: Filter },
            ].map((status) => (
              <button
                key={status.value}
                onClick={() => {
                  setSelectedStatus(status.value);
                  setOffset(0);
                }}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                  selectedStatus === status.value
                    ? "bg-orange-600 text-white"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                <status.icon className="h-4 w-4" />
                {status.label}
              </button>
            ))}
          </div>

          {/* 검색 */}
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="암장, 세터, 난이도 검색..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pr-4 pl-10 text-white placeholder-zinc-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none md:w-80"
            />
          </div>
        </div>

        {/* 통계 */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          {[
            { label: "전체", value: total, color: "blue" },
            {
              label: "검토 대기",
              value: routes.filter((r) => r.status === "pending").length,
              color: "yellow",
            },
            {
              label: "우선 검토",
              value: routes.filter((r) => r.status === "needs_review").length,
              color: "orange",
            },
            {
              label: "평균 신뢰도",
              value: `${Math.round(routes.reduce((sum, r) => sum + (r.parsing_confidence || 0), 0) / routes.length || 0)}%`,
              color: "green",
            },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
            >
              <div className="text-sm text-zinc-400">{stat.label}</div>
              <div className="mt-1 text-2xl font-bold text-white">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* 루트 목록 */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
          </div>
        ) : filteredRoutes.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-zinc-400">
            <AlertCircle className="mb-4 h-12 w-12" />
            <p>검토 대기 중인 루트가 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {filteredRoutes.map((route, idx) => (
                <motion.div
                  key={route.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all hover:border-zinc-700"
                >
                  <div className="flex flex-col gap-4 md:flex-row">
                    {/* 이미지 */}
                    <div className="relative h-32 w-full flex-shrink-0 overflow-hidden rounded-lg md:w-32">
                      {route.image_url ? (
                        <Image
                          src={route.image_url}
                          alt="Route"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-zinc-600">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* 정보 */}
                    <div className="flex-1">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {route.gym?.name || "Unknown Gym"}
                          </h3>
                          <p className="text-sm text-zinc-400">
                            {route.gym?.address || "No address"}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(route.status)}`}
                        >
                          {getStatusLabel(route.status)}
                        </span>
                      </div>

                      <div className="mb-3 grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <span className="text-xs text-zinc-500">세터</span>
                          <p className="text-sm text-white">{route.parsed_setter_name || "-"}</p>
                        </div>
                        <div>
                          <span className="text-xs text-zinc-500">난이도</span>
                          <p className="text-sm text-white">
                            {route.parsed_difficulty || "-"}
                            {route.parsed_color && (
                              <span className="ml-2 text-zinc-400">({route.parsed_color})</span>
                            )}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-zinc-500">세팅일</span>
                          <p className="text-sm text-white">
                            {route.parsed_set_date
                              ? new Date(route.parsed_set_date).toLocaleDateString("ko-KR")
                              : "-"}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-zinc-500">신뢰도</span>
                          <p
                            className={`text-sm font-medium ${getConfidenceColor(route.parsing_confidence || 0)}`}
                          >
                            {route.parsing_confidence || 0}%
                          </p>
                        </div>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedRoute(route);
                            setShowDetailModal(true);
                          }}
                          className="flex items-center gap-1 rounded-lg bg-zinc-800 px-3 py-1.5 text-sm text-white transition-colors hover:bg-zinc-700"
                        >
                          <Eye className="h-4 w-4" />
                          상세
                        </button>
                        {route.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(route.id)}
                              className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-green-500"
                            >
                              <CheckCircle className="h-4 w-4" />
                              승인
                            </button>
                            <button
                              onClick={() => handleReject(route.id)}
                              className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-red-500"
                            >
                              <XCircle className="h-4 w-4" />
                              거부
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(route.id)}
                          className="flex items-center gap-1 rounded-lg bg-zinc-800 px-3 py-1.5 text-sm text-red-400 transition-colors hover:bg-zinc-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* 페이지네이션 */}
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-zinc-400">
                {offset + 1} - {Math.min(offset + limit, total)} / {total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                  className="rounded-lg bg-zinc-800 p-2 text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setOffset(offset + limit)}
                  disabled={offset + limit >= total}
                  className="rounded-lg bg-zinc-800 p-2 text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* 상세 모달 */}
      <AnimatePresence>
        {showDetailModal && selectedRoute && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="mb-4 text-2xl font-bold text-white">루트 상세 정보</h2>

              {/* 이미지 */}
              {selectedRoute.image_url && (
                <div className="relative mb-4 h-64 w-full overflow-hidden rounded-lg">
                  <Image
                    src={selectedRoute.image_url}
                    alt="Route"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}

              {/* 정보 */}
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 text-sm font-medium text-zinc-400">암장</h3>
                  <p className="text-white">{selectedRoute.gym?.name || "Unknown Gym"}</p>
                  <p className="text-sm text-zinc-400">
                    {selectedRoute.gym?.address || "No address"}
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-medium text-zinc-400">Instagram 캡션</h3>
                  <p className="text-sm whitespace-pre-wrap text-white">{selectedRoute.caption}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-zinc-400">파싱 결과</h3>
                    <ul className="space-y-1 text-sm">
                      <li className="text-zinc-300">
                        세터: {selectedRoute.parsed_setter_name || "-"}
                      </li>
                      <li className="text-zinc-300">
                        난이도: {selectedRoute.parsed_difficulty || "-"}
                      </li>
                      <li className="text-zinc-300">색깔: {selectedRoute.parsed_color || "-"}</li>
                      <li className="text-zinc-300">
                        세팅일: {selectedRoute.parsed_set_date || "-"}
                      </li>
                      <li className="text-zinc-300">
                        벽 섹션: {selectedRoute.parsed_wall_section || "-"}
                      </li>
                      <li className="text-zinc-300">
                        타입: {selectedRoute.parsed_route_type || "-"}
                      </li>
                      <li className={getConfidenceColor(selectedRoute.parsing_confidence || 0)}>
                        신뢰도: {selectedRoute.parsing_confidence || 0}%
                      </li>
                    </ul>
                  </div>

                  {selectedRoute.parsed_tags &&
                    Array.isArray(selectedRoute.parsed_tags) &&
                    selectedRoute.parsed_tags.length > 0 && (
                      <div>
                        <h3 className="mb-2 text-sm font-medium text-zinc-400">태그</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedRoute.parsed_tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-300"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                <div className="flex gap-2">
                  <a
                    href={selectedRoute.instagram_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-white transition-colors hover:bg-zinc-700"
                  >
                    Instagram에서 보기
                  </a>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-white transition-colors hover:bg-zinc-700"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
