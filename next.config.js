/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  experimental: {
    outputFileTracingIncludes: {
      '/**': ['./prisma/dev.db', './prisma/schema.prisma', './prisma/**/*'],
    },
  },
};

module.exports = nextConfig;

