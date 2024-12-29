import React from 'react';
import { ModeToggle } from '@shared/ui';

export const Header = () => (
  <header className="p-4 flex gap-2 bg-background text-foreground text-center transition-colors duration-200">
    <div className="flex gap-2 flex-grow justify-start items-center">
      <a href="/">Home</a>
      <a href="/gather-here">Gahter</a>
    </div>
    <ModeToggle />
  </header>
);
