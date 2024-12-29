import React from 'react';
import { Header } from './header';
import { Footer } from './footer';

interface LayoutDefaultProps {
  children: React.ReactNode;
}
export const LayoutDefault: React.FC<LayoutDefaultProps> = ({ children }) => {
  return (
    <div className="min-h-screen max-w-xl flex flex-col">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};
