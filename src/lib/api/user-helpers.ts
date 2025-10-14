/**
 * 사용자 프로필 관리 API Helper 함수
 * 서버 컴포넌트 및 API 라우트에서 사용
 */

import type { Tables } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

import type { User } from "@supabase/supabase-js";

// 타입 정의
type Profile = Tables<"profiles">;

export interface ProfileResponse {
  profile: Profile;
}

export interface CurrentUserWithProfile {
  user: User;
  profile: Profile;
}

/**
 * 사용자 프로필 조회
 */
export async function getUserProfile(userId: string): Promise<ProfileResponse> {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch user profile: ${error.message}`);
  }

  return { profile };
}

/**
 * 사용자 프로필 업데이트 (없으면 생성)
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Profile>,
): Promise<ProfileResponse> {
  const supabase = await createClient();

  // 사용자 정보 가져오기 (email 필요)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    throw new Error("User email not found");
  }

  // upsert를 사용하여 프로필이 없으면 생성, 있으면 업데이트
  const { data: profile, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        email: user.email,
        ...updates,
      },
      {
        onConflict: "id",
      },
    )
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update user profile: ${error.message}`);
  }

  return { profile };
}

/**
 * 현재 로그인한 사용자 정보 조회 (auth + profile)
 */
export async function getCurrentUserWithProfile(): Promise<CurrentUserWithProfile> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Not authenticated");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    throw new Error(`Failed to fetch profile: ${profileError.message}`);
  }

  return { user, profile };
}
