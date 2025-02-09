import { useGoogleLogin } from '@react-oauth/google';
import { ArrowRight, Mail, Lock } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import useAuthStore from '@/features/login/model/store';
import { Button, Card, CardHeader, CardTitle, Input, Separator } from '@/shared/ui';
import { CardContent, CardDescription, CardFooter } from '@/shared/ui/card';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { login, loginWithGoogle, isLoading, error, isAuthenticated, clearError } = useAuthStore();

  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname || '/';

  // 일반 로그인 핸들러
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  // Google 로그인 핸들러
  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      await loginWithGoogle(response.access_token);
    },
    onError: () => {
      console.error('Google login failed');
    },
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
          <CardTitle className="text-2xl font-bold text-center">로그인</CardTitle>
          <CardDescription className="text-center">클라이밍 모임에 참여하기 위해 로그인해주세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="이메일"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>
            {error && <p className="text-sm text-destructive animate-fade-in">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '로그인 중...' : '로그인'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">또는</span>
            </div>
          </div>

          <Button type="button" variant="outline" className="w-full" onClick={() => googleLogin()} disabled={isLoading}>
            <img src="/google.svg" alt="Google" className="mr-2 h-4 w-4" />
            Google로 계속하기
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
          <p>
            아직 회원이 아니신가요?{' '}
            <a href="/signup" className="text-primary hover:underline">
              회원가입
            </a>
          </p>
          <p>
            <a href="/forgot-password" className="text-primary hover:underline">
              비밀번호를 잊으셨나요?
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export { LoginPage };
