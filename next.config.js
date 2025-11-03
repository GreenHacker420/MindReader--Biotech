/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Server Components caching
  experimental: {
    cacheComponents: true,
    cacheLife: {
      // Cache configuration for different routes
      default: {
        stale: 60 * 60, // 1 hour
        revalidate: 60 * 60 * 24, // 24 hours
        expire: 60 * 60 * 24 * 7, // 7 days
      },
      // Short-lived cache for dynamic content
      dynamic: {
        stale: 10,
        revalidate: 60,
        expire: 60 * 60,
      },
      // Long-lived cache for static content
      static: {
        stale: 60 * 60 * 24,
        revalidate: 60 * 60 * 24 * 7,
        expire: 60 * 60 * 24 * 30,
      },
    },
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Headers for caching
  async headers() {
    return [
      {
        source: '/api/articles/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/api/resources/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=1800, stale-while-revalidate=3600',
          },
        ],
      },
      {
        source: '/api/datasets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=1800, stale-while-revalidate=3600',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [];
  },

  // Rewrites
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    };
  },
};

module.exports = nextConfig;
