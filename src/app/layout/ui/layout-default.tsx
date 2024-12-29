import React from 'react';
import { Header } from './header';
import { Footer } from './footer';

interface LayoutDefaultProps {
  children: React.ReactNode;
}
export const LayoutDefault: React.FC<LayoutDefaultProps> = ({ children }) => {
  return (
    <div>
      <Header />
      Default Layout
      {children}
      <Footer />
    </div>
  );
};
