// config/routes.ts
import React, { lazy } from 'react';
import { type RouteObject } from 'react-router-dom'; // React Router의 타입 사용

import { LayoutAuth } from '@app/layout';

const LandingPage = lazy(() => import('@pages/landing'));
const LoginPage = lazy(() => import('@pages/login'));
const GatheringPage = lazy(() => import('@pages/gathering'));
const GatheringItemPage = lazy(() => import('@pages/gathering-item'));

// Route 인터페이스를 RouteObject를 확장하여 정의
export interface Route extends Omit<RouteObject, 'children'> {
  name: string;
  element: React.ReactNode;
  layout?: React.ElementType;
  protected?: boolean;
  children?: Route[];
}

const commonRoutes: Route[] = [
  {
    name: 'Landing',
    path: '/',
    element: <LandingPage />,
  },
  {
    name: 'Gathering',
    path: '/gather-here',
    element: <GatheringPage />,
    layout: LayoutAuth,
    protected: true,
    children: [
      {
        name: 'GatheringItem',
        path: ':id',
        element: <GatheringItemPage />,
        protected: true,
      },
    ],
  },
  {
    name: 'Login',
    path: '/login',
    element: <LoginPage />,
  },
];

export const routes: Route[] = [
  ...commonRoutes,
  {
    name: 'Base',
    path: '*',
    element: <LandingPage />,
  },
];
