/**
 * Lazy Loading Utilities
 * Optimized dynamic imports for code splitting
 */

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

/**
 * Create a lazily loaded component with custom loading state
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options?: {
    loading?: ComponentType;
    ssr?: boolean;
  }
) {
  return dynamic(importFn, {
    loading: options?.loading,
    ssr: options?.ssr ?? false, // Disable SSR for 3D components by default
  });
}

/**
 * Preload a component for better UX
 */
export function preloadComponent(importFn: () => Promise<any>) {
  // Trigger the import but don't wait for it
  importFn().catch((err) => {
    console.warn('Preload failed:', err);
  });
}

/**
 * Lazy load with retry logic for flaky connections
 */
export function lazyLoadWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  retries = 3
) {
  return lazyLoad(
    () =>
      new Promise((resolve, reject) => {
        const attemptLoad = async (attemptsLeft: number) => {
          try {
            const module = await importFn();
            resolve(module);
          } catch (error) {
            if (attemptsLeft <= 0) {
              reject(error);
            } else {
              console.warn(
                `Failed to load component, retrying... (${attemptsLeft} attempts left)`
              );
              setTimeout(() => attemptLoad(attemptsLeft - 1), 1000);
            }
          }
        };
        attemptLoad(retries);
      })
  );
}

/**
 * Batch preload multiple components
 */
export function preloadComponents(
  importFns: Array<() => Promise<any>>
) {
  importFns.forEach((fn) => preloadComponent(fn));
}
