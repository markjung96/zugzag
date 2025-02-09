import React from 'react';

import { Footer } from './footer';
import { Header } from './header';

interface LayoutAuthProps {
  children: React.ReactNode;
}
export const LayoutAuth: React.FC<LayoutAuthProps> = ({ children }) => {
  return (
    <div className="min-h-screen max-w-xl flex flex-col">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};
