import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  // Images optimization
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  // Faster builds
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
