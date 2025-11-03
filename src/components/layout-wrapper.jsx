'use client';

import { usePathname } from 'next/navigation';
import { Navigation } from './navigation';
import { AppBackground } from './app-background';

export function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <>
      {!isAdmin && <AppBackground />}
      {!isAdmin && <Navigation />}
      <main 
        id="main-content" 
        role="main" 
        className={isAdmin ? "relative" : "relative pt-12 md:pt-16"}
      >
        {children}
      </main>
    </>
  );
}
