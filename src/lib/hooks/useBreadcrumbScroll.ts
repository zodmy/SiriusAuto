'use client';

import { useEffect, useRef, useCallback } from 'react';

export const useBreadcrumbScroll = () => {
  const breadcrumbRef = useRef<HTMLElement>(null);

  const scrollToEnd = useCallback(() => {
    if (breadcrumbRef.current && window.innerWidth <= 640) {
      setTimeout(() => {
        if (breadcrumbRef.current) {
          breadcrumbRef.current.scrollTo({
            left: breadcrumbRef.current.scrollWidth,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [scrollToEnd]);

  return { breadcrumbRef, scrollToEnd };
};
