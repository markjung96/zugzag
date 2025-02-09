import { useGoogleLogin } from '@react-oauth/google';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import useAuthStore from '@/features/login/model/store';
import { Button, Card, CardHeader, CardTitle } from '@/shared/ui';
import { CardContent, CardDescription } from '@/shared/ui/card';

const LoginPage = () => {
  const navigate = useNavigate();

  const { loginWithGoogle, isLoading, error, isAuthenticated, clearError } = useAuthStore();

  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname || '/';

  // Google 로그인 핸들러
  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      await loginWithGoogle(response.access_token);
    },
    onError: () => {
      console.error('Google login failed');
    },
    scope: 'profile email',
  });

  // 인증 상태가 변경되면 리다이렉트
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, from]);

  // 에러 메시지 자동 제거
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-center">환영합니다</CardTitle>
          <CardDescription className="text-center">
            클라이밍 모임에 참여하기 위해 Google 계정으로 로그인해주세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-sm text-destructive text-center animate-fade-in">{error}</p>}

          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => googleLogin()}
            disabled={isLoading}
          >
            <img src="/icon/google.png" alt="Google" className="h-5 w-5" />
            {isLoading ? '로그인 중...' : 'Google로 계속하기'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export { LoginPage };
