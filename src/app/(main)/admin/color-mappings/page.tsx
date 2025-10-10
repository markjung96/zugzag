"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Edit, Palette, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

interface ColorMapping {
  id: string;
  gym_id: string;
  gym: {
    id: string;
    name: string;
  };
  color: string;
  difficulty_normalized: number;
  difficulty_label: string | null;
  notes: string | null;
  created_at: string;
}

interface Gym {
  id: string;
  name: string;
}

export default function ColorMappingsPage() {
  const [mappings, setMappings] = useState<ColorMapping[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGym, setSelectedGym] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMapping, setEditingMapping] = useState<ColorMapping | null>(null);

  // 폼 상태
  const [formData, setFormData] = useState({
    gym_id: "",
    color: "",
    difficulty_normalized: 50,
    difficulty_label: "",
    notes: "",
  });

  // 데이터 로드
  useEffect(() => {
    fetchGyms();
    fetchMappings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGym]);

  const fetchGyms = async () => {
    try {
      const response = await fetch("/api/gyms?limit=100");
      const data = await response.json();
      if (response.ok) {
        setGyms(data.results || []);
      }
    } catch (error) {
      console.error("Error fetching gyms:", error);
    }
  };

  const fetchMappings = async () => {
    setLoading(true);
    try {
      const params = selectedGym ? `?gym_id=${selectedGym}` : "";
      const response = await fetch(`/api/admin/color-mappings${params}`);
      const data = await response.json();

      if (response.ok) {
        setMappings(data.mappings);
      } else {
        console.error("Failed to fetch mappings:", data.error);
      }
    } catch (error) {
      console.error("Error fetching mappings:", error);
    } finally {
      setLoading(false);
    }
  };

  // 추가
  const handleAdd = async () => {
    if (!formData.gym_id || !formData.color) {
      alert("암장과 색깔은 필수입니다.");
      return;
    }

    try {
      const response = await fetch("/api/admin/color-mappings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("추가되었습니다!");
        setShowAddModal(false);
        resetForm();
        fetchMappings();
      } else {
        const data = await response.json();
        alert(`추가 실패: ${data.error}`);
      }
    } catch (error) {
      console.error("Error adding mapping:", error);
      alert("추가 중 오류가 발생했습니다.");
    }
  };

  // 수정
  const handleUpdate = async () => {
    if (!editingMapping) return;

    try {
      const response = await fetch(`/api/admin/color-mappings/${editingMapping.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("수정되었습니다!");
        setEditingMapping(null);
        resetForm();
        fetchMappings();
      } else {
        const data = await response.json();
        alert(`수정 실패: ${data.error}`);
      }
    } catch (error) {
      console.error("Error updating mapping:", error);
      alert("수정 중 오류가 발생했습니다.");
    }
  };

  // 삭제
  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/admin/color-mappings/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("삭제되었습니다.");
        fetchMappings();
      } else {
        const data = await response.json();
        alert(`삭제 실패: ${data.error}`);
      }
    } catch (error) {
      console.error("Error deleting mapping:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const resetForm = () => {
    setFormData({
      gym_id: "",
      color: "",
      difficulty_normalized: 50,
      difficulty_label: "",
      notes: "",
    });
  };

  const startEdit = (mapping: ColorMapping) => {
    setEditingMapping(mapping);
    setFormData({
      gym_id: mapping.gym_id,
      color: mapping.color,
      difficulty_normalized: mapping.difficulty_normalized,
      difficulty_label: mapping.difficulty_label || "",
      notes: mapping.notes || "",
    });
  };

  // 색깔 배경색 매핑
  const getColorBg = (color: string) => {
    const colorMap: Record<string, string> = {
      흰색: "bg-white text-black",
      white: "bg-white text-black",
      노란색: "bg-yellow-400 text-black",
      yellow: "bg-yellow-400 text-black",
      주황색: "bg-orange-500 text-white",
      orange: "bg-orange-500 text-white",
      초록색: "bg-green-500 text-white",
      green: "bg-green-500 text-white",
      파란색: "bg-blue-500 text-white",
      blue: "bg-blue-500 text-white",
      보라색: "bg-purple-500 text-white",
      purple: "bg-purple-500 text-white",
      빨간색: "bg-red-500 text-white",
      red: "bg-red-500 text-white",
      검은색: "bg-black text-white",
      black: "bg-black text-white",
      분홍색: "bg-pink-400 text-white",
      pink: "bg-pink-400 text-white",
      회색: "bg-gray-500 text-white",
      gray: "bg-gray-500 text-white",
      grey: "bg-gray-500 text-white",
    };

    return colorMap[color.toLowerCase()] || "bg-zinc-700 text-white";
  };

  // 난이도 색상
  const getDifficultyColor = (normalized: number) => {
    if (normalized < 20) return "text-green-500";
    if (normalized < 40) return "text-yellow-500";
    if (normalized < 60) return "text-orange-500";
    if (normalized < 80) return "text-red-500";
    return "text-purple-500";
  };

  // 암장별 그룹화
  const groupedMappings = mappings.reduce(
    (acc, mapping) => {
      const gymName = mapping.gym.name;
      if (!acc[gymName]) {
        acc[gymName] = [];
      }
      acc[gymName].push(mapping);
      return acc;
    },
    {} as Record<string, ColorMapping[]>,
  );

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* 헤더 */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-white">색깔 매핑 관리</h1>
            <p className="text-zinc-400">암장별 색깔 → 난이도 매핑을 설정하세요</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-500"
          >
            <Plus className="h-5 w-5" />
            추가
          </button>
        </div>

        {/* 암장 필터 */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-zinc-300">암장 필터</label>
          <select
            value={selectedGym || ""}
            onChange={(e) => setSelectedGym(e.target.value || null)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none md:w-80"
          >
            <option value="">전체 암장</option>
            {gyms.map((gym) => (
              <option key={gym.id} value={gym.id}>
                {gym.name}
              </option>
            ))}
          </select>
        </div>

        {/* 매핑 목록 */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
          </div>
        ) : Object.keys(groupedMappings).length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-zinc-400">
            <Palette className="mb-4 h-12 w-12" />
            <p>색깔 매핑이 없습니다.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-orange-500 hover:text-orange-400"
            >
              첫 매핑 추가하기
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedMappings).map(([gymName, gymMappings]) => (
              <motion.div
                key={gymName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
              >
                <h2 className="mb-4 text-xl font-bold text-white">{gymName}</h2>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {gymMappings
                    .sort((a, b) => a.difficulty_normalized - b.difficulty_normalized)
                    .map((mapping) => (
                      <motion.div
                        key={mapping.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-medium ${getColorBg(mapping.color)}`}
                          >
                            {mapping.color}
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => startEdit(mapping)}
                              className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(mapping.id)}
                              className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <span className="text-xs text-zinc-500">난이도 점수</span>
                            <p
                              className={`text-2xl font-bold ${getDifficultyColor(mapping.difficulty_normalized)}`}
                            >
                              {mapping.difficulty_normalized}
                            </p>
                          </div>

                          {mapping.difficulty_label && (
                            <div>
                              <span className="text-xs text-zinc-500">라벨</span>
                              <p className="text-sm text-white">{mapping.difficulty_label}</p>
                            </div>
                          )}

                          {mapping.notes && (
                            <div>
                              <span className="text-xs text-zinc-500">메모</span>
                              <p className="text-sm text-zinc-300">{mapping.notes}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* 추가/수정 모달 */}
      <AnimatePresence>
        {(showAddModal || editingMapping) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => {
              setShowAddModal(false);
              setEditingMapping(null);
              resetForm();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="mb-4 text-2xl font-bold text-white">
                {editingMapping ? "색깔 매핑 수정" : "색깔 매핑 추가"}
              </h2>

              <div className="space-y-4">
                {/* 암장 선택 */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    암장 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.gym_id}
                    onChange={(e) => setFormData({ ...formData, gym_id: e.target.value })}
                    disabled={!!editingMapping}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none disabled:opacity-50"
                  >
                    <option value="">선택하세요</option>
                    {gyms.map((gym) => (
                      <option key={gym.id} value={gym.id}>
                        {gym.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 색깔 */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    색깔 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="예: 파란색, blue"
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-white placeholder-zinc-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                  />
                </div>

                {/* 난이도 점수 */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    난이도 점수 (0~100) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={formData.difficulty_normalized}
                    onChange={(e) =>
                      setFormData({ ...formData, difficulty_normalized: Number(e.target.value) })
                    }
                    className="w-full"
                  />
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-zinc-400">입문 (0)</span>
                    <span
                      className={`text-2xl font-bold ${getDifficultyColor(formData.difficulty_normalized)}`}
                    >
                      {formData.difficulty_normalized}
                    </span>
                    <span className="text-zinc-400">최고급 (100)</span>
                  </div>
                </div>

                {/* 라벨 */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    라벨 (선택)
                  </label>
                  <input
                    type="text"
                    value={formData.difficulty_label}
                    onChange={(e) => setFormData({ ...formData, difficulty_label: e.target.value })}
                    placeholder="예: 중급, V4"
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-white placeholder-zinc-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                  />
                </div>

                {/* 메모 */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    메모 (선택)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="추가 설명"
                    rows={2}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-white placeholder-zinc-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                  />
                </div>

                {/* 버튼 */}
                <div className="flex gap-2">
                  <button
                    onClick={editingMapping ? handleUpdate : handleAdd}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-500"
                  >
                    <Save className="h-4 w-4" />
                    {editingMapping ? "수정" : "추가"}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingMapping(null);
                      resetForm();
                    }}
                    className="flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-white transition-colors hover:bg-zinc-700"
                  >
                    <X className="h-4 w-4" />
                    취소
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
