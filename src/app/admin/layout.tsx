import { AdminProviders } from '@/lib/components/AdminProviders';
import { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <AdminProviders>{children}</AdminProviders>;
}
