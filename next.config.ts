import type { NextConfig } from "next";

const nextConfig = {
  output: 'export',
  // basePath: '/spotify-visualization', // Kommentieren Sie diese Zeile aus für lokale Entwicklung
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
