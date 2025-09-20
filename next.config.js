/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.app',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    ENABLE_GENKIT_SERVER: process.env.ENABLE_GENKIT_SERVER,
  },
  // Enable standalone output for deployment
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
