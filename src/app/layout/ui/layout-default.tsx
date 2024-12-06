import React from 'react';

interface LayoutDefaultProps {
  children: React.ReactNode;
}
export const LayoutDefault: React.FC<LayoutDefaultProps> = ({ children }) => {
  return (
    <div>
      Default Layout
      {children}
    </div>
  );
};
