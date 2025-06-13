import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: undefined,
      allowedOrigins: undefined,
    },
    reactCompiler: true,
  },
};

export default nextConfig;
