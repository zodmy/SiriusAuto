'use client';

import { ReactNode } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface PageLayoutProps {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  showBreadcrumbs?: boolean;
  className?: string;
}

export default function PageLayout({ children, breadcrumbs = [], showBreadcrumbs = true, className = 'bg-gray-50' }: PageLayoutProps) {
  return (
    <div className={`flex flex-col min-h-screen ${className}`}>
      <Header />
      <main className='flex-grow'>
        {showBreadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}
        {children}
      </main>
      <Footer />
    </div>
  );
}
