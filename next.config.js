/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  // use brotli compression
  compress: false,
  sassOptions: {
    includePaths: [__dirname]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cravatar.com',
        port: '',
        pathname: '/avatar/**'
      },
      {
        protocol: 'https',
        hostname: process.env.OSS_BASE_HOST,
        port: '',
        pathname: '/**'
      }
    ]
  },
}


const withBundleAnalyzer = require('@next/bundle-analyzer')()

module.exports =
  process.env.ANALYZE === 'true' ? withBundleAnalyzer(nextConfig) : nextConfig
