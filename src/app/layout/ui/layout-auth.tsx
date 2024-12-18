import React from 'react';
import { Header } from './header';
import { Footer } from './footer';

interface LayoutAuthProps {
  children: React.ReactNode;
}
export const LayoutAuth: React.FC<LayoutAuthProps> = ({ children }) => {
  return (
    <div className="">
      <Header />
      Layout Needs auth
      <main>{children}</main>
      <Footer />
    </div>
  );
};
