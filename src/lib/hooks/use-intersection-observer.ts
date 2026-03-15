/**
 * useIntersectionObserver Hook
 * For lazy loading components when they enter viewport
 */

import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<HTMLDivElement>, boolean] {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false,
  } = options;

  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // If already visible and frozen, don't observe
    if (freezeOnceVisible && isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, freezeOnceVisible, isVisible]);

  return [elementRef, isVisible];
}

/**
 * Lazy load component wrapper
 */
export function LazyLoadComponent({
  children,
  placeholder = null,
  threshold = 0.1,
}: {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  threshold?: number;
}) {
  const [ref, isVisible] = useIntersectionObserver({
    threshold,
    freezeOnceVisible: true,
  });

  return <div ref={ref}>{isVisible ? children : placeholder}</div>;
}
