import React from 'react';
import LandingPage from '@pages/landing';

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
];
