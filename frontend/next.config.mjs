/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  reactStrictMode: false,
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Bundle optimization
  experimental: {
    optimizePackageImports: [
      'react-icons',
      'framer-motion',
      'react-markdown',
    ],
  },
  
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  async rewrites() {
    // Get backend URL from environment variable
    // Use BACKEND_API_URL for server-side proxy (without NEXT_PUBLIC_ prefix)
    // Fallback to NEXT_PUBLIC_API_URL if BACKEND_API_URL is not set
    const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5254';
    
    // Remove trailing slash and /api if present
    const baseUrl = backendUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
    
    return [
      {
        source: '/api/:path*',
        destination: `${baseUrl}/api/:path*`,
      },
    ];
  },
  
  // SEO-friendly headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
