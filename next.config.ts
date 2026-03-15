import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/nyc-tax-viz',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
