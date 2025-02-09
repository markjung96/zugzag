import { ContainerLoading } from '@shared/ui';
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { routes, type Route as AppRoute } from '../config/routes';

// Route를 재귀적으로 렌더링하는 함수
const renderRoute = (route: AppRoute) => {
  const { path, element, children, layout: Layout } = route;

  // 레이아웃이 있는 경우 적용
  const wrappedElement = Layout ? <Layout>{element}</Layout> : element;

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
