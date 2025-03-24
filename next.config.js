/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
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
      }
    ]
  },
}


const withBundleAnalyzer = require('@next/bundle-analyzer')()

module.exports =
  process.env.ANALYZE === 'true' ? withBundleAnalyzer(nextConfig) : nextConfig
