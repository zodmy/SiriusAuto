import { AdminAuthProvider } from '@/lib/components/AdminAuthProvider';
import { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
