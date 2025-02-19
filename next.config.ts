import type { NextConfig } from "next";

const nextConfig = {
  output: 'export',
  basePath: '/spotify-visualization',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
