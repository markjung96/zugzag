/**
 * 관리자 API Helper 함수
 * 서버 컴포넌트 및 API 라우트에서 사용
 */

import type { Tables } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

import type { User } from "@supabase/supabase-js";

// 타입 정의
type PendingRoute = Tables<"pending_routes">;
type ColorMapping = Tables<"gym_color_mappings">;
type Profile = Tables<"profiles">;
type Gym = Tables<"gyms">;

export interface AdminPermissionCheck {
  authorized: boolean;
  user: User | null;
  profile: Pick<Profile, "role"> | null;
}

export interface PendingRouteWithGym extends PendingRoute {
  gym: Pick<Gym, "id" | "name" | "address"> | null;
}

export interface PendingRoutesResponse {
  routes: PendingRouteWithGym[];
  total: number;
}

export interface ColorMappingWithGym extends ColorMapping {
  gym: Pick<Gym, "id" | "name"> | null;
}

export interface ColorMappingsResponse {
  mappings: ColorMappingWithGym[];
}

export interface CreateColorMappingData {
  gym_id: string;
  color: string;
  difficulty_normalized: number;
  difficulty_label?: string;
  notes?: string;
  created_by: string;
}

export interface UpdatePendingRouteData {
  final_setter_name?: string;
  final_difficulty?: string;
  final_difficulty_normalized?: number;
  final_color?: string;
  final_set_date?: string;
  final_wall_section?: string;
  final_route_type?: string;
  final_notes?: string;
}

export interface UpdateColorMappingData {
  color?: string;
  difficulty_normalized?: number;
  difficulty_label?: string;
  notes?: string;
}

export interface SuccessResponse {
  success: true;
}

export interface ApproveRouteResponse {
  routeId: string;
  success: true;
}

/**
 * 현재 사용자가 관리자 또는 리더인지 확인
 */
export async function checkAdminPermission(): Promise<AdminPermissionCheck> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { authorized: false, user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const authorized = !!(profile?.role && ["admin", "leader"].includes(profile.role));

  return { authorized, user, profile };
}

/**
 * 검토 대기 루트 목록 조회
 */
export async function getPendingRoutes(params: {
  status?: string;
  gymId?: string;
  limit?: number;
  offset?: number;
}): Promise<PendingRoutesResponse> {
  const supabase = await createClient();
  const { status = "pending", gymId, limit = 50, offset = 0 } = params;

  let query = supabase
    .from("pending_routes")
    .select(
      `
      *,
      gym:gyms(id, name, address)
    `,
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status !== "all") {
    query = query.eq("status", status);
  }

  if (gymId) {
    query = query.eq("gym_id", gymId);
  }

  const { data: routes, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch pending routes: ${error.message}`);
  }

  // 총 개수 조회
  let countQuery = supabase.from("pending_routes").select("*", { count: "exact", head: true });

  if (status !== "all") {
    countQuery = countQuery.eq("status", status);
  }

  if (gymId) {
    countQuery = countQuery.eq("gym_id", gymId);
  }

  const { count } = await countQuery;

  return { routes, total: count || 0 };
}

/**
 * 검토 대기 루트 수정
 */
export async function updatePendingRoute(
  id: string,
  updates: UpdatePendingRouteData,
): Promise<PendingRoute> {
  const supabase = await createClient();

  const { data: route, error } = await supabase
    .from("pending_routes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update pending route: ${error.message}`);
  }

  return route;
}

/**
 * 검토 대기 루트 삭제
 */
export async function deletePendingRoute(id: string): Promise<SuccessResponse> {
  const supabase = await createClient();

  const { error } = await supabase.from("pending_routes").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete pending route: ${error.message}`);
  }

  return { success: true };
}

/**
 * 검토 대기 루트 승인
 */
export async function approvePendingRoute(id: string): Promise<ApproveRouteResponse> {
  const supabase = await createClient();

  const { data: routeId, error } = await supabase.rpc("approve_pending_route", {
    pending_route_id: id,
  });

  if (error) {
    throw new Error(`Failed to approve pending route: ${error.message}`);
  }

  return { routeId, success: true };
}

/**
 * 검토 대기 루트 거부
 */
export async function rejectPendingRoute(id: string, reason?: string): Promise<SuccessResponse> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("reject_pending_route", {
    pending_route_id: id,
    reason: reason || undefined,
  });

  if (error) {
    throw new Error(`Failed to reject pending route: ${error.message}`);
  }

  return { success: true };
}

/**
 * 색깔 매핑 목록 조회
 */
export async function getColorMappings(gymId?: string): Promise<ColorMappingsResponse> {
  const supabase = await createClient();

  let query = supabase
    .from("gym_color_mappings")
    .select(
      `
      *,
      gym:gyms(id, name)
    `,
    )
    .order("gym_id", { ascending: true })
    .order("difficulty_normalized", { ascending: true });

  if (gymId) {
    query = query.eq("gym_id", gymId);
  }

  const { data: mappings, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch color mappings: ${error.message}`);
  }

  return { mappings };
}

/**
 * 색깔 매핑 생성
 */
export async function createColorMapping(
  data: CreateColorMappingData,
): Promise<{ mapping: ColorMapping }> {
  const supabase = await createClient();

  const { data: mapping, error } = await supabase
    .from("gym_color_mappings")
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create color mapping: ${error.message}`);
  }

  return { mapping };
}

/**
 * 색깔 매핑 수정
 */
export async function updateColorMapping(
  id: string,
  updates: UpdateColorMappingData,
): Promise<{ mapping: ColorMapping }> {
  const supabase = await createClient();

  const { data: mapping, error } = await supabase
    .from("gym_color_mappings")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update color mapping: ${error.message}`);
  }

  return { mapping };
}

/**
 * 색깔 매핑 삭제
 */
export async function deleteColorMapping(id: string): Promise<SuccessResponse> {
  const supabase = await createClient();

  const { error } = await supabase.from("gym_color_mappings").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete color mapping: ${error.message}`);
  }

  return { success: true };
}
