import React from 'react'
import Prose from '@/components/common/prose'
import dayjs from 'dayjs'
import Main from '@/components/layout/main'
import Breadcrumb from '@/components/common/breadcrumb'
import { getPagePostInfo } from '@/services/post'
import PostView from '@/components/custom/View/post'
import { type Metadata } from 'next/types'
import Link from 'next/link'
import { getCommentsByCid } from '@/models/comments'
import { getReadingStats } from '@/lib/readingTime'
import CommentList from '@/components/common/comment'
import LikeButton from '@/components/common/like-button'
import { siteConfig } from '@/config/site'

/** 从正文 HTML 提取第一张图片地址，作为社交分享封面 */
const extractFirstImage = (html: string): string | undefined => {
  const match = /<img[^>]+src=["']([^"']+)["']/i.exec(html)
  return match?.[1]
}

/** 从正文 HTML 生成纯文本摘要（去标签、压空白、截断） */
const buildPlainDescription = (html: string, length = 150): string | undefined => {
  if (!html) return undefined
  const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  return text ? text.slice(0, length) : undefined
}

export async function generateMetadata (
  { params }: { params: { category: string, slug: string } }
): Promise<Metadata> {
  const {
    title,
    content,
    createdAt,
    updatedAt,
    tagNames
  } = await getPagePostInfo({ slug: params.slug })

  const description = buildPlainDescription(content)
  const image = extractFirstImage(content)
  const url = `/post/${params.category}/${params.slug}`

  return {
    title,
    description,
    keywords: tagNames && tagNames.length > 0 ? tagNames : undefined,
    alternates: {
      canonical: url
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url,
      publishedTime: createdAt ? new Date(createdAt).toISOString() : undefined,
      modifiedTime: updatedAt ? new Date(updatedAt).toISOString() : undefined,
      authors: [siteConfig.name],
      tags: tagNames,
      images: image ? [{ url: image }] : undefined
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      images: image ? [image] : undefined
    }
  }
}

const Content: React.FC<{ params: { category: string, slug: string } }> = async (
  { params }) => {
  const {
    title,
    content,
    createdAt,
    updatedAt,
    name,
    category,
    viewsNum,
    cid,
    likesNum,
    tags,
    tagNames
  } = await getPagePostInfo({ slug: params.slug })

  const comments = cid ? await getCommentsByCid(cid) : []
  const commentsNum = comments.length

  const { readingTime, wordCount } = getReadingStats(content)

  // BlogPosting 结构化数据，帮助搜索引擎理解文章元信息
  const canonicalUrl = `${siteConfig.url.replace(/\/$/, '')}/post/${params.category}/${params.slug}`
  const image = extractFirstImage(content)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: buildPlainDescription(content),
    datePublished: createdAt ? new Date(createdAt).toISOString() : undefined,
    dateModified: (updatedAt ?? createdAt) ? new Date(updatedAt ?? createdAt).toISOString() : undefined,
    author: {
      '@type': 'Person',
      name: siteConfig.name,
      url: siteConfig.url
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name
    },
    keywords: tagNames && tagNames.length > 0 ? tagNames.join(', ') : undefined,
    image: image ? [image] : undefined,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl
    }
  }

  return (
    <Main>
      <script
        type="application/ld+json"
        // 转义 < 防止正文中出现 </script> 提前闭合标签
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <div className="md:max-w-3xl max-w-full md:min-w-[48rem] min-w-[88vw]">
        <article className="md:max-w-3xl max-w-full md:min-w-[48rem] text-left flex-1 prose min-h-[22vh]">
          <Breadcrumb items={[{
            name,
            href: `/category/${category as string}`
          }, { name: '正文' }]}/>
          <h2 className="md:mb-2 mt-4 dark:text-white">{title}</h2>
          <div className="text-xs mb-5 -mt-3 md:mt-3 my-3 text-gray-500 space-x-1.5 dark:text-gray-400 ">
            <span>{dayjs(createdAt).format('YYYY-MM-DD HH:mm')}</span>
            <span>•</span>
            <Link href={`/category/${category as string}`}
                  className="text-gray-500 dark:text-gray-400 no-underline font-normal">{name}</Link>
            <span>•</span>
            <span>{viewsNum}人阅读</span>
            {commentsNum > 0 && <span>•</span>}
            {commentsNum > 0 && <span>{commentsNum}条评论</span>}
            {likesNum > 0 && <span>•</span>}
            {likesNum > 0 && <span>{likesNum}人喜欢</span>}
            <span>•</span>
            <span>共 {wordCount} 字</span>
            <span>•</span>
            <span>阅读时间约 {readingTime} 分钟</span>
          </div>
          <Prose content={content}/>
        </article>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6 mb-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">标签：</span>
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/tag/${tag}`}
                className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}

        <div className="flex justify-center items-center my-8 py-4">
          <div className="flex items-center gap-2">
            <LikeButton cid={cid as number} initialLikes={likesNum} />
          </div>
        </div>
        <div className="text-xs mb-5 -mt-3 md:mt-3 my-3 text-gray-400 space-x-1.5 dark:text-gray-500">
          本作品采用 <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 font-normal hover:underline">知识共享署名-相同方式共享 4.0 国际许可协议</a> 进行许可。
        </div>
        <CommentList cid={cid as number}/>
      </div>
      <PostView cid={cid as number}/>
    </Main>
  )
}

export default Content
