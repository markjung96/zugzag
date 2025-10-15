"use client";

import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

export const signInWithGoogle = async (redirectTo?: string) => {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
      skipBrowserRedirect: false, // 명시적으로 브라우저 리다이렉트 활성화
      queryParams: {
        access_type: "offline",
        prompt: "select_account", // 'consent' 대신 'select_account' 사용
      },
    },
  });

  if (error) {
    console.error("Google 로그인 오류:", error);
    throw error;
  }

  return data;
};

export const signInWithGithub = async (redirectTo?: string) => {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    console.error("GitHub 로그인 오류:", error);
    throw error;
  }

  return data;
};

export const signInWithEmail = async (email: string, password: string) => {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("이메일 로그인 오류:", error);
    throw error;
  }

  return data;
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  metadata?: {
    full_name?: string;
    nickname?: string;
    avatar_url?: string;
  },
  inviteCode?: string | null,
) => {
  const supabase = createClient();

  // 초대 코드가 있으면 콜백 URL에 포함
  const redirectUrl = inviteCode
    ? `${window.location.origin}/auth/callback?invite=${inviteCode}`
    : `${window.location.origin}/auth/callback`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: redirectUrl,
    },
  });

  if (error) {
    console.error("회원가입 오류:", error);
    throw error;
  }

  return data;
};

export const signOut = async () => {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("로그아웃 오류:", error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("사용자 정보 가져오기 오류:", error);
    return null;
  }

  return user;
};

export const getUserProfile = async (userId: string) => {
  const supabase = createClient();

  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();

  if (error) {
    console.error("프로필 가져오기 오류:", error);
    return null;
  }

  return data;
};

export const updateUserProfile = async (
  userId: string,
  updates: Database["public"]["Tables"]["profiles"]["Update"],
) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .update(updates as never)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("프로필 업데이트 오류:", error);
    throw error;
  }

  return data;
};

export const resetPassword = async (email: string) => {
  const supabase = createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  if (error) {
    console.error("비밀번호 재설정 오류:", error);
    throw error;
  }
};
