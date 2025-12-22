/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output for containerized deployments (Railway, Docker)
  output: 'standalone',
  
  // Image configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
  
  // Production optimizations
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Disable x-powered-by header for security
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Redirects for common routes
  redirects: async () => {
    return [
      {
        source: '/home',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },
  
  // Experimental features for better performance
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['docx', 'xlsx'],
  },
};

export default nextConfig;
