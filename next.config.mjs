// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.fontcdn.ir',
      },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

// اجازه دادن به همه درخواست‌های cross-origin در حالت توسعه
if (process.env.NODE_ENV === 'development') {
  nextConfig.allowedDevOrigins = ['*'];
}

export default nextConfig;