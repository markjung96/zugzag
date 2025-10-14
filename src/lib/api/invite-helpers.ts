/**
 * 크루 초대 링크 관리 API Helper 함수
 * 서버 컴포넌트 및 API 라우트에서 사용
 */

import type { Tables } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

// 타입 정의
type CrewInvite = Tables<"crew_invites">;
type Profile = Tables<"profiles">;
type Crew = Tables<"crews">;
type CrewMember = Tables<"crew_members">;

export interface InviteWithRelations extends CrewInvite {
  creator: Pick<Profile, "id" | "full_name" | "nickname" | "avatar_url"> | null;
  crew: Pick<Crew, "id" | "name"> | null;
}

export interface InvitesResponse {
  invites: InviteWithRelations[];
}

export interface InviteWithCrew extends CrewInvite {
  crew: Pick<
    Crew,
    "id" | "name" | "description" | "logo_url" | "is_public" | "location" | "max_members"
  > | null;
}

export interface InviteResponse {
  invite: InviteWithCrew;
}

export interface JoinByInviteResponse {
  member: CrewMember;
  crew: Pick<
    Crew,
    "id" | "name" | "description" | "logo_url" | "is_public" | "location" | "max_members"
  >;
}

export interface CreateInviteData {
  crew_id: string;
  created_by: string;
  max_uses?: number | null;
  expires_at?: string | null;
}

export interface SuccessResponse {
  success: true;
}

/**
 * 초대 링크 생성
 */
export async function createInvite(data: CreateInviteData): Promise<{ invite: CrewInvite }> {
  const supabase = await createClient();

  // 초대 코드 생성 (중복되지 않을 때까지 재시도)
  let inviteCode: string;
  let codeExists = true;
  let attempts = 0;
  const maxAttempts = 10;

  while (codeExists && attempts < maxAttempts) {
    const { data: codeData, error: codeError } = await supabase.rpc("generate_invite_code");

    if (codeError || !codeData) {
      throw new Error("Failed to generate invite code");
    }

    inviteCode = codeData;

    // 코드 중복 확인
    const { data: existing } = await supabase
      .from("crew_invites")
      .select("id")
      .eq("invite_code", inviteCode)
      .maybeSingle();

    codeExists = !!existing;
    attempts++;
  }

  if (codeExists) {
    throw new Error("Failed to generate unique invite code");
  }

  // 초대 생성
  const { data: invite, error } = await supabase
    .from("crew_invites")
    .insert({
      crew_id: data.crew_id,
      created_by: data.created_by,
      invite_code: inviteCode!,
      max_uses: data.max_uses,
      expires_at: data.expires_at,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create invite: ${error.message}`);
  }

  return { invite };
}

/**
 * 크루의 초대 링크 목록 조회
 */
export async function getCrewInvites(crewId: string): Promise<InvitesResponse> {
  const supabase = await createClient();

  const { data: invites, error } = await supabase
    .from("crew_invites")
    .select(
      `
      *,
      creator:profiles!crew_invites_created_by_fkey(id, full_name, nickname, avatar_url),
      crew:crews(id, name)
    `,
    )
    .eq("crew_id", crewId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch invites: ${error.message}`);
  }

  return { invites };
}

/**
 * 초대 코드로 초대 정보 조회
 */
export async function getInviteByCode(inviteCode: string): Promise<InviteResponse> {
  const supabase = await createClient();

  const { data: invite, error } = await supabase
    .from("crew_invites")
    .select(
      `
      *,
      crew:crews(
        id,
        name,
        description,
        logo_url,
        is_public,
        location,
        max_members
      )
    `,
    )
    .eq("invite_code", inviteCode.toUpperCase())
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch invite: ${error.message}`);
  }

  if (!invite) {
    throw new Error("초대 링크를 찾을 수 없습니다");
  }

  // 유효성 검증
  const { data: isValid } = await supabase.rpc("is_invite_valid", {
    p_invite_code: inviteCode.toUpperCase(),
  });

  if (!isValid) {
    throw new Error("만료되었거나 사용할 수 없는 초대 링크입니다");
  }

  return { invite };
}

/**
 * 초대 링크로 크루 가입
 */
export async function joinCrewByInvite(
  inviteCode: string,
  userId: string,
): Promise<JoinByInviteResponse> {
  const supabase = await createClient();

  // 1. 프로필 존재 확인
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, climbing_level")
    .eq("id", userId)
    .single();

  // 프로필이 없거나 climbing_level이 설정되지 않았으면 온보딩 필요
  if (profileError || !profile || !profile.climbing_level) {
    throw new Error("ONBOARDING_REQUIRED");
  }

  // 2. 초대 정보 조회 및 검증
  const { invite } = await getInviteByCode(inviteCode);

  if (!invite.crew) {
    throw new Error("크루 정보를 찾을 수 없습니다");
  }

  // 3. 이미 가입했는지 확인
  const { data: existingMember } = await supabase
    .from("crew_members")
    .select("*")
    .eq("crew_id", invite.crew_id)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingMember && existingMember.is_active) {
    throw new Error("이미 크루에 가입되어 있습니다");
  }

  // 4. 정원 확인
  if (invite.crew.max_members) {
    const { count } = await supabase
      .from("crew_members")
      .select("*", { count: "exact", head: true })
      .eq("crew_id", invite.crew_id)
      .eq("is_active", true);

    if (count && count >= invite.crew.max_members) {
      throw new Error("크루 정원이 가득 찼습니다");
    }
  }

  // 5. 크루 멤버로 추가 (기존 멤버 재활성화 또는 신규 추가)
  if (existingMember) {
    const { data: member, error: updateError } = await supabase
      .from("crew_members")
      .update({ is_active: true, joined_at: new Date().toISOString() })
      .eq("id", existingMember.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to reactivate membership: ${updateError.message}`);
    }

    // 초대 사용 기록
    await recordInviteUse(invite.id, userId);

    return { member, crew: invite.crew };
  } else {
    const { data: member, error: insertError } = await supabase
      .from("crew_members")
      .insert({
        crew_id: invite.crew_id,
        user_id: userId,
        role: "member",
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to join crew: ${insertError.message}`);
    }

    // 초대 사용 기록
    await recordInviteUse(invite.id, userId);

    return { member, crew: invite.crew };
  }
}

/**
 * 초대 사용 기록 생성 및 사용 횟수 증가
 */
async function recordInviteUse(inviteId: string, userId: string): Promise<void> {
  const supabase = await createClient();

  // 중복 사용 방지 체크
  const { data: existingUse } = await supabase
    .from("crew_invite_uses")
    .select("*")
    .eq("invite_id", inviteId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingUse) {
    return; // 이미 사용 기록이 있으면 스킵
  }

  // 사용 기록 생성
  const { error: useError } = await supabase.from("crew_invite_uses").insert({
    invite_id: inviteId,
    user_id: userId,
  });

  if (useError) {
    console.error("Failed to record invite use:", useError);
    // 에러가 나도 가입은 성공으로 처리 (중요하지 않은 로그)
  }

  // 사용 횟수 증가 - 직접 업데이트로 처리
  const { data: currentInvite } = await supabase
    .from("crew_invites")
    .select("current_uses")
    .eq("id", inviteId)
    .single();

  if (currentInvite) {
    await supabase
      .from("crew_invites")
      .update({ current_uses: (currentInvite.current_uses || 0) + 1 })
      .eq("id", inviteId);
  }
}

/**
 * 초대 링크 삭제
 */
export async function deleteInvite(inviteId: string): Promise<SuccessResponse> {
  const supabase = await createClient();

  const { error } = await supabase.from("crew_invites").delete().eq("id", inviteId);

  if (error) {
    throw new Error(`Failed to delete invite: ${error.message}`);
  }

  return { success: true };
}

/**
 * 초대 링크 업데이트
 */
export async function updateInvite(
  inviteId: string,
  updates: Partial<CrewInvite>,
): Promise<{ invite: CrewInvite }> {
  const supabase = await createClient();

  const { data: invite, error } = await supabase
    .from("crew_invites")
    .update(updates)
    .eq("id", inviteId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update invite: ${error.message}`);
  }

  return { invite };
}
