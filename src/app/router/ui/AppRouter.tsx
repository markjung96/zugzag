import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { routes } from '../const/routes';
import { ContainerLoading } from '@/shared';

import type { Route as RouteType } from '../const/routes';

export const AppRouter = () => (
  <Suspense fallback={<ContainerLoading />}>
    <Routes>
      {routes.map((item, index) => (
        <RouteWrapper key={index} {...item} />
      ))}
    </Routes>
  </Suspense>
);

const RouteWrapper = (props: RouteType) => {
  const { element, path, layout: Layout } = props;

  return Layout ? (
    <Layout>
      <Route path={path} element={path === '/*' ? <Navigate to="/" replace /> : element} />
    </Layout>
  ) : (
    <Route path={path} element={path === '/*' ? <Navigate to="/" replace /> : element} />
  );
};
