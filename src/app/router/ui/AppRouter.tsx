import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { routes } from '../config/routes';
import { ContainerLoading } from '@shared/ui';

export const AppRouter = () => (
  <Suspense fallback={<ContainerLoading />}>
    <Routes>
      {routes.map((item, index) => {
        if (item.path === '/*') {
          return <Route key={index} path="/*" element={<Navigate to="/" replace />} />;
        }
        const { path, element, ...rest } = item;
        return <Route key={index} path={path} element={element} {...rest} />;
      })}
    </Routes>
  </Suspense>
);
