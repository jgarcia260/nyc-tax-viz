/**
 * Loading Component
 * Used as fallback for lazy-loaded components
 */

export function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-neutral-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    </div>
  );
}

export function LoadingFullScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-neutral-50/80 backdrop-blur-sm">
      <Loading />
    </div>
  );
}

export function LoadingText({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 min-h-[400px]">
      <Loading />
      <p className="text-neutral-600 text-sm animate-pulse">{text}</p>
    </div>
  );
}
