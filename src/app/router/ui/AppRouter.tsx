import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { routes } from '../const/routes';

export const AppRouter = () => (
  <Routes>
    {routes.map(({ path, element }) => (
      <Route key={path} path={path} element={element} />
    ))}
  </Routes>
);
