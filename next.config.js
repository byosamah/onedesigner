/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Enable ESLint during builds for security
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Enable TypeScript validation during builds
    ignoreBuildErrors: false,
  },
  experimental: {
    // Disable problematic static generation
    workerThreads: false,
    cpus: 1
  },
  images: {
    domains: ['localhost', 'onedesigner.app', 'onedesigner.io'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'uploadthing.com',
      },
      {
        protocol: 'https',
        hostname: '**.onedesigner.app',
      },
    ],
  },
}

module.exports = nextConfig