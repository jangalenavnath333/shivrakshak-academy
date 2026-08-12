import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  // Images optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/vi/**',
      },
      {
        protocol: 'https',
        hostname: 'thtvsqxxbkhdapaxtcqi.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'bytoykdukngbwiespbwc.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Faster builds
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
