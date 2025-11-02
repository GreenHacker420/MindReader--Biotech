'use client';

import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from '../components/toast';

export function Providers({ children }) {
  return (
    <SessionProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </SessionProvider>
  );
}
