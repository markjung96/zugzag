import React, { lazy } from 'react';
import { LayoutAuth } from '@app/layout'; // 기본 레이아웃

export interface Route {
  name: string;
  path: string;
  element: React.ReactNode;
  layout?: React.ElementType;
}

const LandingPage = lazy(() => import('@pages/landing'));

const GatheringPage = lazy(() => import('@pages/gathering'));

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
  },
];

export const routes: Route[] = [
  ...commonRoutes,
  {
    name: 'Base',
    path: '/*',
    element: <LandingPage />,
  },
];
