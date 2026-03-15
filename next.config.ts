import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // basePath only needed for GitHub Pages, not Vercel
  // basePath: '/nyc-tax-viz',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
