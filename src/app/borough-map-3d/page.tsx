"use client";

import dynamic from 'next/dynamic';

// Dynamically import the 3D component to avoid SSR issues
const BoroughMap3D = dynamic(() => import('@/components/BoroughMap3D'), {
  ssr: false,
  loading: () => <div className="w-full h-screen flex items-center justify-center">Loading 3D Map...</div>
});

export default function BoroughMap3DPage() {
  return (
    <div className="w-full h-screen">
      <BoroughMap3D />
    </div>
  );
}
