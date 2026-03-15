"use client";

import dynamic from 'next/dynamic';

// Dynamically import the unified 3D component to avoid SSR issues
const BoroughMap3DUnified = dynamic(() => import('@/components/BoroughMap3DUnified'), {
  ssr: false,
  loading: () => <div className="w-full h-screen flex items-center justify-center">Loading 3D Map...</div>
});

export default function BoroughMap3DPage() {
  return (
    <div className="w-full h-screen">
      <BoroughMap3DUnified 
        showTaxData={false}
        title="NYC Borough 3D Map"
        description="Interactive 3D SimCity-style visualization"
      />
    </div>
  );
}
