/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/spotify-visualization',
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_SPOTIFY_CLIENT_ID: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
    NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET,
  },
}

module.exports = nextConfig 