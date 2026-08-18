/** @type {import('next').NextConfig} */
const stableBuild = process.env.STABLE_BUILD === '1'

const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  // use brotli compression
  compress: false,
  ...(stableBuild
    ? {
        experimental: {
          cpus: 1,
          workerThreads: false
        },
        typescript: {
          ignoreBuildErrors: true
        },
        eslint: {
          ignoreDuringBuilds: true
        }
      }
    : {}),
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
