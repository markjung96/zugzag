import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { routes } from '../config/routes';
import { ContainerLoading } from '@/shared';

import type { Route as RouteType } from '../config/routes';

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
  const { element, path, ...rest } = props;

  return <Route index={true} path={path} element={path === '/*' ? <Navigate to="/" replace /> : element} {...rest} />;
};
