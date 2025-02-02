// config/routes.ts
import React, { lazy } from 'react';
import { LayoutAuth } from '@app/layout';
import { RouteObject } from 'react-router-dom'; // React Router의 타입 사용

const LandingPage = lazy(() => import('@pages/landing'));
const GatheringPage = lazy(() => import('@pages/gathering'));
const GatheringItemPage = lazy(() => import('@pages/gathering-item'));

// Route 인터페이스를 RouteObject를 확장하여 정의
export interface Route extends Omit<RouteObject, 'children'> {
  name: string;
  element: React.ReactNode;
  layout?: React.ElementType;
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
    children: [
      {
        name: 'GatheringItem',
        path: ':id', // 부모 경로에 상대적인 경로
        element: <GatheringItemPage />,
        layout: LayoutAuth,
      },
    ],
  },
];

export const routes: Route[] = [
  ...commonRoutes,
  {
    name: 'Base',
    path: '*', // v6에서는 '/*' 대신 '*' 사용
    element: <LandingPage />,
  },
];
