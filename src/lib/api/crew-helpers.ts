/**
 * 크루 관리 API Helper 함수
 * 서버 컴포넌트 및 API 라우트에서 사용
 */

import type { Tables } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

// 타입 정의
type Crew = Tables<"crews">;
type Profile = Tables<"profiles">;
type CrewMember = Tables<"crew_members">;
type CrewJoinRequest = Tables<"crew_join_requests">;

export interface CrewWithCreatorAndCount extends Crew {
  creator: Pick<Profile, "id" | "full_name" | "avatar_url" | "nickname"> | null;
  member_count: { count: number }[];
}

export interface CrewsResponse {
  crews: CrewWithCreatorAndCount[];
  total: number;
}

export interface MemberWithUser {
  id: string;
  user_id: string;
  crew_id: string;
  role: "owner" | "admin" | "member";
  is_active: boolean | null;
  joined_at: string | null;
  user: Pick<Profile, "id" | "full_name" | "avatar_url" | "nickname" | "climbing_level" | "bio">;
}

export interface CrewDetail extends Crew {
  creator: Pick<Profile, "id" | "full_name" | "avatar_url" | "nickname"> | null;
  members: MemberWithUser[];
}

export interface CrewDetailResponse {
  crew: CrewDetail;
  membership: CrewMember | null;
}

export interface CreateCrewData {
  name: string;
  description?: string;
  location?: string;
  is_public?: boolean;
  max_members?: number;
  created_by: string;
  logo_url?: string;
}

export interface UpdateCrewData {
  name?: string;
  description?: string;
  location?: string;
  is_public?: boolean;
  max_members?: number;
  logo_url?: string;
}

export interface SuccessResponse {
  success: true;
}

export interface JoinRequestWithUser extends CrewJoinRequest {
  user: Pick<Profile, "id" | "full_name" | "avatar_url" | "nickname" | "climbing_level" | "bio">;
  reviewer: Pick<Profile, "id" | "full_name" | "nickname"> | null;
}

export interface JoinRequestsResponse {
  requests: JoinRequestWithUser[];
}

export interface UserCrewMembership {
  id: string;
  role: string;
  joined_at: string | null;
  crew: Pick<Crew, "id" | "name" | "description" | "logo_url" | "is_public" | "location">;
}

export interface UserCrewsResponse {
  crews: UserCrewMembership[];
}

/**
 * 크루 목록 조회
 */
export async function getCrews(params: {
  search?: string;
  is_public?: boolean;
  limit?: number;
  offset?: number;
}): Promise<CrewsResponse> {
  const supabase = await createClient();
  const { search, is_public, limit = 50, offset = 0 } = params;

  let query = supabase
    .from("crews")
    .select(
      `
      *,
      creator:profiles!crews_created_by_fkey(id, full_name, avatar_url, nickname),
      member_count:crew_members(count)
    `,
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  // 공개 여부 필터
  if (is_public !== undefined) {
    query = query.eq("is_public", is_public);
  }

  // 검색
  if (search && search.trim()) {
    query = query.or(
      `name.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`,
    );
  }

  const { data: crews, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch crews: ${error.message}`);
  }

  // 총 개수 조회
  let countQuery = supabase.from("crews").select("*", { count: "exact", head: true });

  if (is_public !== undefined) {
    countQuery = countQuery.eq("is_public", is_public);
  }

  if (search && search.trim()) {
    countQuery = countQuery.or(
      `name.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`,
    );
  }

  const { count } = await countQuery;

  return { crews, total: count || 0 };
}

/**
 * 크루 상세 조회
 */
export async function getCrewById(id: string, userId?: string): Promise<CrewDetailResponse> {
  const supabase = await createClient();

  const { data: crew, error } = await supabase
    .from("crews")
    .select(
      `
      *,
      creator:profiles!crews_created_by_fkey(id, full_name, avatar_url, nickname),
      members:crew_members(
        id, user_id, crew_id, role, is_active, joined_at,
        user:profiles(id, full_name, avatar_url, nickname, climbing_level, bio)
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch crew: ${error.message}`);
  }

  // 사용자의 멤버십 정보 확인
  let membership = null;
  if (userId) {
    const { data: membershipData } = await supabase
      .from("crew_members")
      .select("*")
      .eq("crew_id", id)
      .eq("user_id", userId)
      .eq("is_active", true)
      .single();

    membership = membershipData;
  }

  return { crew, membership };
}

/**
 * 크루 생성
 */
export async function createCrew(data: CreateCrewData): Promise<{ crew: Crew }> {
  const supabase = await createClient();

  // 1. 크루 생성
  const { data: crew, error: crewError } = await supabase
    .from("crews")
    .insert({
      name: data.name,
      description: data.description,
      location: data.location,
      is_public: data.is_public ?? true,
      max_members: data.max_members,
      created_by: data.created_by,
      logo_url: data.logo_url,
    })
    .select()
    .single();

  if (crewError) {
    throw new Error(`Failed to create crew: ${crewError.message}`);
  }

  // 2. 생성자를 owner로 자동 추가
  const { error: memberError } = await supabase.from("crew_members").insert({
    crew_id: crew.id,
    user_id: data.created_by,
    role: "owner",
    is_active: true,
  });

  if (memberError) {
    // 크루 생성 롤백
    await supabase.from("crews").delete().eq("id", crew.id);
    throw new Error(`Failed to add creator as member: ${memberError.message}`);
  }

  return { crew };
}

/**
 * 크루 수정
 */
export async function updateCrew(id: string, updates: UpdateCrewData): Promise<{ crew: Crew }> {
  const supabase = await createClient();

  const { data: crew, error } = await supabase
    .from("crews")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update crew: ${error.message}`);
  }

  return { crew };
}

/**
 * 크루 삭제
 */
export async function deleteCrew(id: string): Promise<SuccessResponse> {
  const supabase = await createClient();

  const { error } = await supabase.from("crews").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete crew: ${error.message}`);
  }

  return { success: true };
}

/**
 * 크루 가입
 */
export async function joinCrew(
  crewId: string,
  userId: string,
  role: "owner" | "admin" | "member" = "member",
): Promise<{ member: CrewMember }> {
  const supabase = await createClient();

  // 1. 프로필 존재 확인
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, nickname")
    .eq("id", userId)
    .single();

  // 프로필이 없거나 닉네임이 없으면 온보딩 필요
  if (profileError || !profile || !profile.nickname) {
    throw new Error("ONBOARDING_REQUIRED");
  }

  // 2. 크루 존재 및 가입 가능 여부 확인
  const { data: crew, error: crewError } = await supabase
    .from("crews")
    .select("id, max_members, is_public")
    .eq("id", crewId)
    .single();

  if (crewError || !crew) {
    throw new Error("크루를 찾을 수 없습니다");
  }

  // 3. 이미 가입되어 있는지 확인
  const { data: existingMember } = await supabase
    .from("crew_members")
    .select("*")
    .eq("crew_id", crewId)
    .eq("user_id", userId)
    .single();

  if (existingMember) {
    if (existingMember.is_active) {
      throw new Error("이미 가입된 크루입니다");
    } else {
      // 탈퇴했던 멤버 재활성화
      const { data: reactivatedMember, error: reactivateError } = await supabase
        .from("crew_members")
        .update({ is_active: true, joined_at: new Date().toISOString() })
        .eq("id", existingMember.id)
        .select()
        .single();

      if (reactivateError) {
        throw new Error(`Failed to reactivate membership: ${reactivateError.message}`);
      }

      return { member: reactivatedMember };
    }
  }

  // 4. 정원 확인
  if (crew.max_members) {
    const { count } = await supabase
      .from("crew_members")
      .select("*", { count: "exact", head: true })
      .eq("crew_id", crewId)
      .eq("is_active", true);

    if (count && count >= crew.max_members) {
      throw new Error("크루 정원이 가득 찼습니다");
    }
  }

  // 5. 멤버 추가
  const { data: member, error: memberError } = await supabase
    .from("crew_members")
    .insert({
      crew_id: crewId,
      user_id: userId,
      role,
      is_active: true,
    })
    .select()
    .single();

  if (memberError) {
    throw new Error(`Failed to join crew: ${memberError.message}`);
  }

  return { member };
}

/**
 * 크루 탈퇴
 */
export async function leaveCrew(crewId: string, userId: string): Promise<SuccessResponse> {
  const supabase = await createClient();

  // 1. 멤버십 확인
  const { data: member, error: memberError } = await supabase
    .from("crew_members")
    .select("*")
    .eq("crew_id", crewId)
    .eq("user_id", userId)
    .eq("is_active", true)
    .single();

  if (memberError || !member) {
    throw new Error("크루 멤버가 아닙니다");
  }

  // 2. owner는 탈퇴 불가
  if (member.role === "owner") {
    throw new Error("크루장은 탈퇴할 수 없습니다. 크루를 삭제하거나 권한을 이양해주세요");
  }

  // 3. 멤버십 비활성화
  const { error: updateError } = await supabase
    .from("crew_members")
    .update({ is_active: false })
    .eq("id", member.id);

  if (updateError) {
    throw new Error(`Failed to leave crew: ${updateError.message}`);
  }

  return { success: true };
}

/**
 * 크루 멤버 목록 조회
 */
export async function getCrewMembers(
  crewId: string,
  isActive?: boolean,
): Promise<{ members: MemberWithUser[] }> {
  const supabase = await createClient();

  let query = supabase
    .from("crew_members")
    .select(
      `
      *,
      user:profiles(id, full_name, avatar_url, nickname, climbing_level, bio)
    `,
    )
    .eq("crew_id", crewId)
    .order("joined_at", { ascending: true });

  if (isActive !== undefined) {
    query = query.eq("is_active", isActive);
  }

  const { data: members, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch crew members: ${error.message}`);
  }

  return { members };
}

/**
 * 크루 멤버 역할 변경
 */
export async function updateMemberRole(
  memberId: string,
  role: "owner" | "admin" | "member",
): Promise<{ member: CrewMember }> {
  const supabase = await createClient();

  const { data: member, error } = await supabase
    .from("crew_members")
    .update({ role })
    .eq("id", memberId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update member role: ${error.message}`);
  }

  return { member };
}

/**
 * 크루 멤버 제거
 */
export async function removeMember(memberId: string): Promise<SuccessResponse> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("crew_members")
    .update({ is_active: false })
    .eq("id", memberId);

  if (error) {
    throw new Error(`Failed to remove member: ${error.message}`);
  }

  return { success: true };
}

/**
 * 유저가 소속된 크루 목록 조회
 */
export async function getUserCrews(userId: string): Promise<UserCrewsResponse> {
  const supabase = await createClient();

  const { data: memberships, error } = await supabase
    .from("crew_members")
    .select(
      `
      id,
      role,
      joined_at,
      crew:crews(
        id,
        name,
        description,
        logo_url,
        is_public,
        location
      )
    `,
    )
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("joined_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch user crews: ${error.message}`);
  }

  return { crews: memberships };
}

/**
 * ==============================================
 * 크루 가입 신청 관리
 * ==============================================
 */

/**
 * 크루 가입 신청 생성
 */
export async function createJoinRequest(data: {
  crew_id: string;
  user_id: string;
  message?: string;
}): Promise<{ request: CrewJoinRequest }> {
  const supabase = await createClient();

  // 1. 프로필 존재 확인
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, nickname")
    .eq("id", data.user_id)
    .single();

  // 프로필이 없으면 온보딩 필요
  if (profileError || !profile) {
    throw new Error("ONBOARDING_REQUIRED");
  }

  // 닉네임이 없으면 온보딩 미완료
  if (!profile.nickname) {
    throw new Error("ONBOARDING_REQUIRED");
  }

  // 2. 이미 멤버인지 확인
  const { data: existingMember } = await supabase
    .from("crew_members")
    .select("*")
    .eq("crew_id", data.crew_id)
    .eq("user_id", data.user_id)
    .single();

  if (existingMember && existingMember.is_active) {
    throw new Error("이미 크루에 가입되어 있습니다");
  }

  // 3. 이미 대기 중인 신청이 있는지 확인
  const { data: existingRequest } = await supabase
    .from("crew_join_requests")
    .select("*")
    .eq("crew_id", data.crew_id)
    .eq("user_id", data.user_id)
    .eq("status", "pending")
    .single();

  if (existingRequest) {
    throw new Error("이미 가입 신청이 대기 중입니다");
  }

  // 4. 크루 정보 확인
  const { data: crew, error: crewError } = await supabase
    .from("crews")
    .select("id, is_public, max_members")
    .eq("id", data.crew_id)
    .single();

  if (crewError || !crew) {
    throw new Error("크루를 찾을 수 없습니다");
  }

  // 5. 정원 확인
  if (crew.max_members) {
    const { count } = await supabase
      .from("crew_members")
      .select("*", { count: "exact", head: true })
      .eq("crew_id", data.crew_id)
      .eq("is_active", true);

    if (count && count >= crew.max_members) {
      throw new Error("크루 정원이 가득 찼습니다");
    }
  }

  // 6. 가입 신청 생성
  const { data: request, error: requestError } = await supabase
    .from("crew_join_requests")
    .insert({
      crew_id: data.crew_id,
      user_id: data.user_id,
      message: data.message,
      status: "pending",
    })
    .select()
    .single();

  if (requestError) {
    throw new Error(`Failed to create join request: ${requestError.message}`);
  }

  return { request };
}

/**
 * 크루 가입 신청 목록 조회
 */
export async function getJoinRequests(
  crewId: string,
  status?: "pending" | "approved" | "rejected",
): Promise<JoinRequestsResponse> {
  const supabase = await createClient();

  let query = supabase
    .from("crew_join_requests")
    .select(
      `
      *,
      user:profiles!crew_join_requests_user_id_fkey(
        id, full_name, avatar_url, nickname, climbing_level, bio
      ),
      reviewer:profiles!crew_join_requests_reviewed_by_fkey(
        id, full_name, nickname
      )
    `,
    )
    .eq("crew_id", crewId)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data: requests, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch join requests: ${error.message}`);
  }

  return { requests };
}

/**
 * 가입 신청 승인
 */
export async function approveJoinRequest(
  requestId: string,
  reviewerId: string,
): Promise<{ request: CrewJoinRequest }> {
  const supabase = await createClient();

  // 1. 신청 정보 조회
  const { data: request, error: requestError } = await supabase
    .from("crew_join_requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (requestError || !request) {
    throw new Error("가입 신청을 찾을 수 없습니다");
  }

  if (request.status !== "pending") {
    throw new Error("이미 처리된 신청입니다");
  }

  // 2. 정원 재확인
  const { data: crew } = await supabase
    .from("crews")
    .select("max_members")
    .eq("id", request.crew_id)
    .single();

  if (crew?.max_members) {
    const { count } = await supabase
      .from("crew_members")
      .select("*", { count: "exact", head: true })
      .eq("crew_id", request.crew_id)
      .eq("is_active", true);

    if (count && count >= crew.max_members) {
      throw new Error("크루 정원이 가득 찼습니다");
    }
  }

  // 3. 크루 멤버로 추가
  const { error: memberError } = await supabase.from("crew_members").insert({
    crew_id: request.crew_id,
    user_id: request.user_id,
    role: "member",
    is_active: true,
  });

  if (memberError) {
    throw new Error(`Failed to add member: ${memberError.message}`);
  }

  // 4. 신청 상태 업데이트
  const { data: updatedRequest, error: updateError } = await supabase
    .from("crew_join_requests")
    .update({
      status: "approved",
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .select()
    .single();

  if (updateError) {
    throw new Error(`Failed to update request: ${updateError.message}`);
  }

  return { request: updatedRequest };
}

/**
 * 가입 신청 거절
 */
export async function rejectJoinRequest(
  requestId: string,
  reviewerId: string,
): Promise<{ request: CrewJoinRequest }> {
  const supabase = await createClient();

  // 1. 신청 정보 조회
  const { data: request, error: requestError } = await supabase
    .from("crew_join_requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (requestError || !request) {
    throw new Error("가입 신청을 찾을 수 없습니다");
  }

  if (request.status !== "pending") {
    throw new Error("이미 처리된 신청입니다");
  }

  // 2. 신청 상태 업데이트
  const { data: updatedRequest, error: updateError } = await supabase
    .from("crew_join_requests")
    .update({
      status: "rejected",
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .select()
    .single();

  if (updateError) {
    throw new Error(`Failed to update request: ${updateError.message}`);
  }

  return { request: updatedRequest };
}

/**
 * 사용자의 가입 신청 조회 (특정 크루)
 */
export async function getUserJoinRequest(
  crewId: string,
  userId: string,
): Promise<{ request: CrewJoinRequest | null }> {
  const supabase = await createClient();

  const { data: request, error } = await supabase
    .from("crew_join_requests")
    .select("*")
    .eq("crew_id", crewId)
    .eq("user_id", userId)
    .eq("status", "pending")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch join request: ${error.message}`);
  }

  return { request };
}
