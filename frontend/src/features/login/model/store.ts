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

        loginWithGoogle: async (accessToken: string) => {
          set({ isLoading: true, error: null });
          try {
            // Google 사용자 정보 가져오기
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
              },
            });

            if (!userInfoResponse.ok) {
              const errorData = await userInfoResponse.json();
              throw new Error(errorData.error_description || 'Google 로그인에 실패했습니다.');
            }

            const googleUser = await userInfoResponse.json();

            // 백엔드 API 호출
            const response = await fetch('/api/auth/google', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
              body: JSON.stringify({
                googleId: googleUser.sub,
                email: googleUser.email,
                name: googleUser.name,
                picture: googleUser.picture,
                locale: googleUser.locale,
                verified_email: googleUser.email_verified,
              }),
              credentials: 'include', // 쿠키 포함
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || '서버 인증에 실패했습니다.');
            }

            const { user, token } = await response.json();

            // JWT 토큰을 localStorage나 secure cookie에 저장
            localStorage.setItem('auth_token', token);

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
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
            await fetch('/api/auth/logout', {
              method: 'POST',
              credentials: 'include',
            });

            // 로컬 스토리지 클리어
            localStorage.removeItem('auth_token');

            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
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
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      },
    ),
  ),
);

export default useAuthStore;
