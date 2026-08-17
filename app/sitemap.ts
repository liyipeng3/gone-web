import { type MetadataRoute } from 'next'
import prisma from '@/lib/prisma'
import { siteConfig } from '@/config/site'

/**
 * 站点地图：包含首页、已发布文章、分类页、标签页。
 * 全部为只读查询。
 */
export default async function sitemap (): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url.replace(/\/$/, '')

  // 已发布文章（携带分类 slug 以拼出 /post/[category]/[slug]）
  const posts = await prisma.posts.findMany({
    select: {
      slug: true,
      updatedAt: true,
      createdAt: true,
      relationships: {
        select: {
          metas: {
            select: { slug: true, type: true }
          }
        },
        where: {
          metas: { type: 'category' }
        }
      }
    },
    where: {
      status: 'publish',
      type: 'post'
    },
    orderBy: { createdAt: 'desc' }
  })

  const postEntries: MetadataRoute.Sitemap = posts
    .filter(post => post.slug)
    .map(post => {
      const category = post.relationships[0]?.metas?.slug ?? 'uncategorized'
      return {
        url: `${baseUrl}/post/${category}/${post.slug as string}`,
        lastModified: post.updatedAt ?? post.createdAt ?? new Date()
      }
    })

  // 分类与标签
  const metas = await prisma.metas.findMany({
    select: { slug: true, type: true },
    where: { type: { in: ['category', 'tag'] } }
  })

  const metaEntries: MetadataRoute.Sitemap = metas
    .filter(meta => meta.slug)
    .map(meta => ({
      url: meta.type === 'category'
        ? `${baseUrl}/category/${meta.slug as string}`
        : `${baseUrl}/tag/${meta.slug as string}`,
      lastModified: new Date()
    }))

  const staticEntries: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/archive`, lastModified: new Date() },
    { url: `${baseUrl}/gallery`, lastModified: new Date() },
    { url: `${baseUrl}/links`, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() }
  ]

  return [...staticEntries, ...postEntries, ...metaEntries]
}
