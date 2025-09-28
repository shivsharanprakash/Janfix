/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '4000' },
    ],
    unoptimized: true,
  },
  experimental: {
    serverActions: false,
  },
};

module.exports = nextConfig;



