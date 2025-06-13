'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AdminAuthContextType {
  isAdmin: boolean | null;
  isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

interface AdminAuthProviderProps {
  children: ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const verifyAccess = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin/check-auth', { credentials: 'include' });
        if (!isMounted) return;

        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.isAdmin);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Не вдалося перевірити статус адміністратора:', err);
        setIsAdmin(false);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    verifyAccess();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const value = {
    isAdmin,
    isLoading,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

interface UseAdminAuthOptions {
  redirectPath?: string;
}

export function useAdminAuth(options: UseAdminAuthOptions = {}) {
  const { redirectPath = '/admin' } = options;
  const context = useContext(AdminAuthContext);
  const router = useRouter();
  
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  
  const { isAdmin, isLoading } = context;
  
  useEffect(() => {
    if (!isLoading && isAdmin === false) {
      router.push(redirectPath);
    }
  }, [isAdmin, isLoading, router, redirectPath]);
  
  return { isAdmin, isLoading };
};
