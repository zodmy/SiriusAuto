import { AdminAuthProvider } from '@/lib/components/AdminAuthProvider';
import { ReactNode } from 'react';

interface AdminDashboardLayoutProps {
  children: ReactNode;
}

export default function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
