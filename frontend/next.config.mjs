/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  reactStrictMode: false,
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
};

export default nextConfig;
