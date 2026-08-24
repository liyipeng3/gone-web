import { type MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'

export default function robots (): MetadataRoute.Robots {
  const baseUrl = siteConfig.url.replace(/\/$/, '')
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // robots.txt 不支持正则分组，需逐条列出待屏蔽路径
      disallow: ['/dashboard', '/editor', '/api']
    },
    sitemap: `${baseUrl}/sitemap.xml`
  }
}
