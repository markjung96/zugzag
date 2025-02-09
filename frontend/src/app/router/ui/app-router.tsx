import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { ContainerLoading } from '@shared/ui';

import ProtectedRouter from './protected-router';
import { routes, type Route as AppRoute } from '../config/routes';

// Route를 재귀적으로 렌더링하는 함수
const renderRoute = (route: AppRoute) => {
  const { path, element, children, layout: Layout, protected: isProtected } = route;

  // 보호된 라우트인 경우 ProtectedRoute로 감싸기
  let wrappedElement = element;
  if (isProtected) {
    wrappedElement = <ProtectedRouter>{element}</ProtectedRouter>;
  }

  // 레이아웃이 있는 경우 적용
  if (Layout) {
    wrappedElement = <Layout>{wrappedElement}</Layout>;
  }

  return (
    <Route key={path} path={path} element={wrappedElement}>
      {children?.map((childRoute) => renderRoute(childRoute))}
    </Route>
  );
};

export const AppRouter = () => (
  <Suspense fallback={<ContainerLoading />}>
    <Routes>
      {routes.map((route) => {
        if (route.path === '*') {
          return <Route key="404" path="*" element={<Navigate to="/" replace />} />;
        }
        return renderRoute(route);
      })}
    </Routes>
  </Suspense>
);
