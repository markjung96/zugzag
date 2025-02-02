import React from 'react';
import { type ClassValue } from 'clsx';

interface DividerProps {
  className?: ClassValue;
  orientation?: 'horizontal' | 'vertical';
  children?: React.ReactNode;
}
const Divider: React.FC<DividerProps> = ({ className = '', orientation = 'horizontal', children }) => {
  if (children) {
    return (
      <div className={`relative w-full my-4 ${className}`}>
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">{children}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        ${orientation === 'horizontal' ? 'w-full h-[1px] my-4' : 'h-full w-[1px] mx-4'}
        bg-border
        ${className}
      `}
      role="separator"
      aria-orientation={orientation}
    />
  );
};

export { Divider };
