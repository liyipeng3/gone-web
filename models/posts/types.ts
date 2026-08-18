// 定义与帖子相关的类型
import { type Prisma } from '@prisma/client'

// 获取帖子列表的参数
export interface GetPostListParams {
  pageNum: number
  pageSize?: number
  mid?: number
  search?: string
}

// 归档列表类型
export interface ArchivePostItem {
  title: string | null
  slug: string | null
  createdAt: Date | null
  category: string
}

export interface ArchiveItem {
  time: string
  posts: ArchivePostItem[]
}

export type ArchiveList = ArchiveItem[]

// 帖子列表项类型（列表/分类/标签页共用）
export interface PostListItem {
  cid: number
  title: string | null
  slug: string | null
  createdAt: Date | null
  updatedAt: Date | null
  text: string | null
  viewsNum: number | null
  likesNum: number | null
  tags: string[]
  category: string
  name: string
  description: string
  commentsNum: number
}

// 热门列表类型
export type HotList = Array<{
  title: string
  slug: string
  category: string
}>

// 帖子创建/更新数据类型
export type PostCreateData = Prisma.postsCreateInput
export type PostUpdateData = Prisma.postsUpdateInput

// 帖子详情（含标签/分类关系）类型，供详情页与服务层复用
export type PostWithRelationships = Prisma.postsGetPayload<{
  include: {
    relationships: {
      include: {
        metas: { select: { name: true, slug: true, type: true } }
      }
    }
  }
}>
