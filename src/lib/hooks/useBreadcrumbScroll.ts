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

    const handleResize = () => {
      scrollToEnd();
    };

    window.addEventListener('resize', handleResize);

    const handleLoad = () => {
      scrollToEnd();
    };

    window.addEventListener('load', handleLoad);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('load', handleLoad);
    };
  }, [scrollToEnd]);

  useEffect(() => {
    if (breadcrumbRef.current && window.innerWidth <= 640) {
      const observer = new MutationObserver(() => {
        scrollToEnd();
      });

      observer.observe(breadcrumbRef.current, {
        childList: true,
        subtree: true,
        attributes: true
      });

      return () => observer.disconnect();
    }
  }, [scrollToEnd]);

  return { breadcrumbRef, scrollToEnd };
};
