/** @type {import('next').NextConfig} */
const nextConfig = {
  // جایگزین images.domains با remotePatterns
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    unoptimized: true,
  },
  output: 'standalone',
  
  // جایگزین serverComponentsExternalPackages با serverExternalPackages
  serverExternalPackages: ['mssql', 'tedious'],
  
  // غیرفعال کردن ESLint در build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // غیرفعال کردن TypeScript errors در build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // اضافه کردن Turbopack config خالی برای رفع خطا
  turbopack: {},
}

module.exports = nextConfig