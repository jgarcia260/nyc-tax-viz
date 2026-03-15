/**
 * Performance Optimization Utilities
 */

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Request idle callback wrapper with fallback
 */
export function runWhenIdle(callback: () => void, timeout = 2000) {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, 1);
  }
}

/**
 * Measure component render time
 */
export function measureRender(componentName: string) {
  const start = performance.now();
  
  return () => {
    const duration = performance.now() - start;
    console.log(`[Performance] ${componentName} rendered in ${duration.toFixed(2)}ms`);
  };
}

/**
 * GPU-accelerated transform
 */
export function gpuAccelerate() {
  return {
    transform: 'translateZ(0)',
    willChange: 'transform',
  };
}

/**
 * Check if device prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get optimal canvas resolution based on device pixel ratio
 */
export function getOptimalDpr(): number {
  if (typeof window === 'undefined') return 1;
  
  const dpr = window.devicePixelRatio || 1;
  
  // Cap at 2 for performance
  return Math.min(dpr, 2);
}

/**
 * Memory-efficient array chunk processor
 */
export async function processInChunks<T, R>(
  items: T[],
  processor: (chunk: T[]) => Promise<R[]>,
  chunkSize = 100
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await processor(chunk);
    results.push(...chunkResults);
    
    // Let browser breathe between chunks
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  
  return results;
}
