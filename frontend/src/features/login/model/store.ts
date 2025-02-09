// src/store/auth.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { type AuthState } from './types';

const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        login: async (email: string, password: string) => {
          set({ isLoading: true, error: null });
          try {
            // TODO: 실제 API 호출로 대체
            const response = await fetch('/api/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
              throw new Error('로그인에 실패했습니다.');
            }

            const user = await response.json();
            set({ user, isAuthenticated: true, isLoading: false });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.',
              isLoading: false,
            });
          }
        },

        loginWithGoogle: async (accessToken: string) => {
          set({ isLoading: true, error: null });
          try {
            // Google 사용자 정보 가져오기
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (!userInfoResponse.ok) {
              throw new Error('Google 로그인에 실패했습니다.');
            }

            const googleUser = await userInfoResponse.json();

            // TODO: 백엔드 API 호출로 대체
            const response = await fetch('/api/auth/google', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                googleId: googleUser.sub,
                email: googleUser.email,
                name: googleUser.name,
                picture: googleUser.picture,
              }),
            });

            if (!response.ok) {
              throw new Error('서버 인증에 실패했습니다.');
            }

            const user = await response.json();
            set({ user, isAuthenticated: true, isLoading: false });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Google 로그인 중 오류가 발생했습니다.',
              isLoading: false,
            });
          }
        },

        logout: async () => {
          set({ isLoading: true });
          try {
            // TODO: 실제 로그아웃 API 호출
            await fetch('/api/logout', { method: 'POST' });
            set({ user: null, isAuthenticated: false, isLoading: false });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : '로그아웃 중 오류가 발생했습니다.',
              isLoading: false,
            });
          }
        },

        clearError: () => set({ error: null }),
      }),
      {
        name: 'auth-storage', // localStorage에 저장될 키 이름
        partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }), // 저장할 상태 선택
      },
    ),
  ),
);

export default useAuthStore;
