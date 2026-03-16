"use client";

import dynamic from 'next/dynamic';

const BoroughMap3DUnified = dynamic(() => import('@/components/BoroughMap3DUnified'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-900 to-blue-950">
      <div className="text-center space-y-4">
        <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
          Loading NYC 3D Map...
        </div>
      </div>
    </div>
  )
});

export default function BoroughMap3DPage() {
  return (
    <div className="w-full h-screen">
      <BoroughMap3DUnified showTaxData={true} />
    </div>
  );
}
