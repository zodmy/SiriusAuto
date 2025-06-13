'use client';

import { ReactNode } from 'react';
import { CartProvider } from '@/lib/components/CartProvider';

interface AdminProvidersProps {
  children: ReactNode;
}

export function AdminProviders({ children }: AdminProvidersProps) {
  return <CartProvider>{children}</CartProvider>;
}
