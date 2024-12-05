import React from 'react';
import LandingPage from '@pages/landing';
import GatheringPage from '@pages/gathering';

export interface Route {
  path: string;
  element: React.ReactNode;
  children?: Route[];
}

export const routes: Route[] = [
  {
    path: '/',
    element: React.createElement(LandingPage),
  },
  {
    path: '/gather-here',
    element: React.createElement(GatheringPage),
  },
];
