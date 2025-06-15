'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AdminAuthContextType {
  isAdmin: boolean | null;
  isLoading: boolean;
  refreshAuth: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

interface AdminAuthProviderProps {
  children: ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const verifyAccess = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/check-auth', { credentials: 'include' });

      if (response.ok) {
        const data = await response.json();
        setIsAdmin(data.isAdmin);
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      console.error('Не вдалося перевірити статус адміністратора:', err);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    verifyAccess();
  }, []);

  useEffect(() => {
    if (!isLoading && isAdmin === false) {
      router.push('/admin');
    }
  }, [isAdmin, isLoading, router]);

  const value = {
    isAdmin,
    isLoading,
    refreshAuth: verifyAccess,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }

  return context;
}
