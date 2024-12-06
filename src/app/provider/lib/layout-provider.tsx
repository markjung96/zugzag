import React, { useState, useEffect } from 'react';
import { useLocation, matchPath } from 'react-router-dom';

import { routes } from '@app/router/config/routes';
import { LayoutDefault } from '@app/layout'; // 기본 레이아웃

interface LayoutProviderProps {
  children: React.ReactNode;
}

const LayoutProvider = ({ children }: LayoutProviderProps) => {
  const location = useLocation();
  const [Layout, setLayout] = useState<React.ElementType>(() => LayoutDefault);

  useEffect(() => {
    // 현재 경로에 매칭되는 레이아웃 찾기
    const matchedRoute = findMatchRoute(location.pathname);
    const layout = matchedRoute?.layout || LayoutDefault;

    // Layout이 변경되었을 경우 업데이트
    if (Layout !== layout) {
      setLayout(() => layout);
    }

    // 페이지 이동 시 스크롤 초기화
    window.scrollTo(0, 0);
  }, [location]);

  return <Layout>{children}</Layout>;
};

export default LayoutProvider;

// 매칭된 라우트와 해당 레이아웃을 찾는 함수
export const findMatchRoute = (path: string) => {
  return routes.find((route) => {
    return matchPath(route.path, path); // React Router v6의 matchPath
  });
};
