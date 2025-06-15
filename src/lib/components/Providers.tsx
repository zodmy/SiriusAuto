'use client';

import { ReactNode } from 'react';
import { CartProvider } from '@/lib/components/CartProvider';
import { AuthProvider } from '@/lib/components/AuthProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}
