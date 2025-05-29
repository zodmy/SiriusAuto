'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UseAdminAuthOptions {
  redirectPath?: string;
}

export function useAdminAuth(options: UseAdminAuthOptions = {}) {
  const { redirectPath = '/admin' } = options;
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
          if (data.isAdmin) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
            router.push(redirectPath);
          }
        } else {
          setIsAdmin(false);
          router.push(redirectPath);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to verify admin status:', err);
        setIsAdmin(false);
        router.push(redirectPath);
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
  }, [router, redirectPath]);

  return { isAdmin, isLoading };
}
