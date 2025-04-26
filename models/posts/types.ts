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
export interface ArchiveItem {
  time: string
  posts: any[]
}

export type ArchiveList = ArchiveItem[]

// 热门列表类型
export type HotList = Array<{
  title: string
  slug: string
  category: string
}>

// 帖子创建/更新数据类型
export type PostCreateData = Prisma.postsCreateInput
export type PostUpdateData = Prisma.postsUpdateInput
