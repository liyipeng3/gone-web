// 帖子标签和分类关系操作
import prisma from '@/lib/prisma'
import { type Prisma } from '@prisma/client'
import { cacheService, cacheKeys } from '@/lib/cache'
import { clearPostRelatedCaches } from './cache-utils'

// Prisma 事务客户端类型
type Tx = Prisma.TransactionClient

/**
 * 更新帖子的标签和分类
 */
export const updateMetas = async (cid: number, category: string, tags: string[]) => {
  // 使用事务处理所有数据库操作，确保原子性
  return await prisma.$transaction(async (tx) => {
    // 删除旧关系
    await tx.relationships.deleteMany({
      where: {
        posts: {
          cid
        }
      }
    })

    // 获取分类 mid
    const categoryMeta = await tx.metas.findFirst({
      where: {
        slug: category,
        type: 'category'
      }
    })

    // 处理所有标签
    const processedTagMids: number[] = []

    // 逐个处理标签，避免使用 Promise.all
    for (const tag of tags) {
      const tagMeta = await tx.metas.findFirst({
        where: {
          slug: tag,
          type: 'tag'
        }
      })

      if (!tagMeta) {
        // 创建新标签
        const newTag = await tx.metas.create({
          data: {
            name: tag,
            slug: tag,
            type: 'tag',
            count: 0
          }
        })
        processedTagMids.push(newTag.mid)
      } else {
        processedTagMids.push(tagMeta.mid)
      }
    }

    // 准备创建关系的数据
    const relationshipData = [
      ...processedTagMids.map(mid => ({ cid, mid })),
      { cid, mid: categoryMeta?.mid }
    ].filter(item => item.mid !== undefined)

    // 使用 createMany 批量创建关系，替代循环创建
    if (relationshipData.length > 0) {
      await tx.relationships.createMany({
        data: relationshipData.map(data => ({
          cid: data.cid,
          mid: data.mid as number
        }))
      })
    }

    // 标签/分类关系发生变更，失效标签云缓存
    cacheService.delByPrefix(cacheKeys.tags)

    return relationshipData
  })
}

/**
 * 在给定事务内同步帖子标签（不触发缓存失效等外部副作用）。
 *
 * 供 updatePostTags 及草稿保存等需要与其它写操作合并进同一事务的场景复用。
 * 缓存失效应由调用方在事务提交后统一执行。
 */
export const syncTagsTx = async (tx: Tx, cid: number, tags: string[]) => {
  // 获取帖子当前的所有标签
  const currentTags = await tx.relationships.findMany({
    where: {
      posts: {
        cid
      },
      metas: {
        type: 'tag'
      }
    },
    include: {
      metas: true
    }
  })

  // 获取当前标签的 mid 列表
  const currentTagMids = currentTags.map(tag => tag.metas.mid)

  // 批量删除所有与该帖子相关的标签关系
  if (currentTagMids.length > 0) {
    await tx.relationships.deleteMany({
      where: {
        cid,
        mid: {
          in: currentTagMids
        }
      }
    })
  }

  // 批量更新标签计数 - 减少旧标签计数
  if (currentTagMids.length > 0) {
    // 使用 updateMany 批量更新标签计数
    await tx.metas.updateMany({
      where: {
        mid: {
          in: currentTagMids
        }
      },
      data: {
        count: {
          decrement: 1
        }
      }
    })
  }

  // 处理新标签 - 收集需要创建的标签和关系
  const newTagsToCreate = []
  const existingTagMids = []
  const relationshipsToCreate = []

  // 先查找所有已存在的标签
  const existingTags = await tx.metas.findMany({
    where: {
      slug: {
        in: tags
      },
      type: 'tag'
    }
  })

  // 创建已存在标签的映射
  const existingTagMap = new Map()
  existingTags.forEach(tag => {
    existingTagMap.set(tag.slug, tag.mid)
  })

  // 处理每个标签
  for (const tag of tags) {
    if (existingTagMap.has(tag)) {
      // 标签已存在，记录其 mid
      const mid = existingTagMap.get(tag)
      existingTagMids.push(mid)
      relationshipsToCreate.push({
        cid,
        mid
      })
    } else {
      // 标签不存在，需要创建
      newTagsToCreate.push({
        name: tag,
        slug: tag,
        type: 'tag',
        count: 1
      })
    }
  }

  // 批量创建新标签
  let newTagIds = []
  if (newTagsToCreate.length > 0) {
    // 注意：SQLite 不支持 createMany 和 returning，所以对于 SQLite 需要单独处理
    // 这里假设使用的是支持 createMany 的数据库如 PostgreSQL 或 MySQL
    const createdTags = await Promise.all(
      newTagsToCreate.map(async tagData =>
        await tx.metas.create({
          data: tagData
        })
      )
    )

    // 收集新创建的标签 ID
    newTagIds = createdTags.map(tag => tag.mid)

    // 为新标签添加关系
    newTagIds.forEach(mid => {
      relationshipsToCreate.push({
        cid,
        mid
      })
    })
  }

  // 批量更新已存在标签的计数
  if (existingTagMids.length > 0) {
    await tx.metas.updateMany({
      where: {
        mid: {
          in: existingTagMids
        }
      },
      data: {
        count: {
          increment: 1
        }
      }
    })
  }

  // 批量创建关系
  if (relationshipsToCreate.length > 0) {
    await tx.relationships.createMany({
      data: relationshipsToCreate
    })
  }

  return { success: true }
}

/**
 * 更新帖子标签（对外接口，自起事务并在提交后失效相关缓存）
 */
export const updatePostTags = async (cid: number, tags: string[]) => {
  // 使用事务处理所有数据库操作，确保原子性
  const result = await prisma.$transaction(async (tx) => await syncTagsTx(tx, cid, tags))

  // 清除相关缓存（标签发生变更，需失效标签云缓存）
  clearPostRelatedCaches({ cid })
  cacheService.delByPrefix(cacheKeys.tags)

  return result
}

/**
 * 在给定事务内同步帖子分类（不触发缓存失效等外部副作用）。
 *
 * 供 updatePostCategory 及草稿保存等需要与其它写操作合并进同一事务的场景复用。
 * 缓存失效应由调用方在事务提交后统一执行。
 */
export const syncCategoryTx = async (tx: Tx, cid: number, category: string) => {
  // 获取帖子当前的分类
  const currentCategory = await tx.relationships.findFirst({
    where: {
      posts: {
        cid
      },
      metas: {
        type: 'category'
      }
    },
    include: {
      metas: true
    }
  })

  // 如果有当前分类，删除关系并减少计数
  if (currentCategory) {
    await tx.relationships.deleteMany({
      where: {
        cid,
        mid: currentCategory.mid
      }
    })

    await tx.metas.update({
      where: {
        mid: currentCategory.mid
      },
      data: {
        count: {
          decrement: 1
        }
      }
    })
  }

  // 查找新分类
  let categoryMeta = await tx.metas.findFirst({
    where: {
      slug: category,
      type: 'category'
    }
  })

  // 如果新分类不存在，创建它
  if (!categoryMeta) {
    categoryMeta = await tx.metas.create({
      data: {
        name: category,
        slug: category,
        type: 'category',
        count: 1
      }
    })
  } else {
    // 更新已有分类计数
    await tx.metas.update({
      where: {
        mid: categoryMeta.mid
      },
      data: {
        count: {
          increment: 1
        }
      }
    })
  }

  // 创建新的关系
  await tx.relationships.create({
    data: {
      cid,
      mid: categoryMeta.mid
    }
  })

  return { success: true }
}

/**
 * 更新帖子分类（对外接口，自起事务并在提交后失效相关缓存）
 */
export const updatePostCategory = async (cid: number, category: string) => {
  // 使用事务处理所有数据库操作，确保原子性
  const result = await prisma.$transaction(async (tx) => await syncCategoryTx(tx, cid, category))

  // 清除相关缓存（分类可能新建，需失效分类列表缓存）
  clearPostRelatedCaches({ cid })
  cacheService.del(cacheKeys.categories)

  return result
}

/**
 * 判断两个标签集合是否等价（忽略顺序与重复）
 */
const sameTags = (a: string[], b: string[]): boolean => {
  const sa = new Set(a)
  const sb = new Set(b)
  if (sa.size !== sb.size) return false
  for (const t of sa) {
    if (!sb.has(t)) return false
  }
  return true
}

export interface SaveDraftInput {
  title?: string | null
  slug: string
  text?: string | null
  category?: string | null
  tags: string[]
}

export interface SaveDraftResult {
  cid: number
  slug: string
  title: string | null
  updatedAt: Date | null
}

/**
 * 原子化保存草稿：草稿 upsert + 标签/分类同步在同一事务内完成，
 * 且仅在标签/分类真正变化时才重写关系，避免每次自动保存的写放大。
 *
 * @param cid 已发布文章（父文章）的 cid
 * @param uid 作者 uid，仅在首次创建草稿时用于关联作者
 * @returns 精简的草稿信息，供前端更新保存状态（不含全量内容，避免覆盖前端本地编辑）
 */
export const saveDraftAtomic = async (
  cid: number,
  input: SaveDraftInput,
  uid: number
): Promise<SaveDraftResult> => {
  const { category, tags, title, text } = input
  // 草稿 slug 统一加 '@' 前缀，避免与父文章已发布 slug 命中唯一索引
  const prefixedSlug = input.slug.startsWith('@') ? input.slug : `@${input.slug}`

  const result = await prisma.$transaction(async (tx) => {
    // 读取现有草稿及其关系（用于 diff 与复用 mids）
    const existing = await tx.posts.findFirst({
      where: { parent: cid, type: 'post_draft' },
      include: { relationships: { include: { metas: true } } }
    })

    // slug 唯一性校验（排除草稿自身）
    const dupCount = await tx.posts.count({
      where: {
        slug: prefixedSlug,
        cid: { not: existing?.cid ?? -1 }
      }
    })
    if (dupCount > 0) {
      throw new DraftSlugConflictError()
    }

    let draftCid: number
    let tagsChanged = true
    let categoryChanged = true

    if (existing) {
      // 计算 diff，决定是否需要重写标签/分类关系
      const currentTags = existing.relationships
        .filter(r => r.metas.type === 'tag')
        .map(r => r.metas.slug)
        .filter((slug): slug is string => slug !== null)
      const currentCategory = existing.relationships
        .find(r => r.metas.type === 'category')?.metas.slug

      tagsChanged = !sameTags(currentTags, tags)
      categoryChanged = Boolean(category) && currentCategory !== category

      const updated = await tx.posts.update({
        where: { cid: existing.cid },
        data: {
          title,
          text,
          slug: prefixedSlug,
          type: 'post_draft',
          status: 'hidden',
          parent: cid
        }
      })
      draftCid = updated.cid
    } else {
      // 首次创建草稿：关联作者，不拷贝原关系（由随后的 sync 函数负责从零创建，避免写放大）
      const created = await tx.posts.create({
        data: {
          title,
          text,
          slug: prefixedSlug,
          users: { connect: { uid } },
          parent: cid,
          type: 'post_draft',
          status: 'hidden'
        }
      })
      draftCid = created.cid
    }

    // 仅在变化时同步标签/分类
    if (tagsChanged) {
      await syncTagsTx(tx, draftCid, tags)
    }
    if (category && categoryChanged) {
      await syncCategoryTx(tx, draftCid, category)
    }

    const draft = await tx.posts.findUniqueOrThrow({
      where: { cid: draftCid },
      select: { cid: true, slug: true, title: true, updatedAt: true }
    })

    return { draft, tagsChanged, categoryChanged }
  })

  // 事务提交后再失效缓存（避免回滚后缓存已被清）
  if (result.tagsChanged || result.categoryChanged) {
    clearPostRelatedCaches({ cid: result.draft.cid })
    if (result.tagsChanged) {
      cacheService.delByPrefix(cacheKeys.tags)
    }
    if (result.categoryChanged) {
      cacheService.del(cacheKeys.categories)
    }
  }

  return {
    cid: result.draft.cid,
    // 返回去掉 '@' 前缀的 slug，与前端展示一致
    slug: result.draft.slug?.replace(/^@/, '') ?? '',
    title: result.draft.title ?? null,
    updatedAt: result.draft.updatedAt ?? null
  }
}

/**
 * 草稿 slug 冲突错误，供路由层转换为 409 响应
 */
export class DraftSlugConflictError extends Error {
  constructor () {
    super('slug is already exist')
    this.name = 'DraftSlugConflictError'
  }
}

/**
 * 发布帖子
 */
export const publishPost = async (cid: number) => {
  const result = await prisma.$transaction(async (tx) => {
    const [post, draft] = await Promise.all([
      tx.posts.findUnique({ where: { cid } }),
      tx.posts.findFirst({
        where: {
          parent: cid,
          type: 'post_draft'
        }
      })
    ])

    if (!post) {
      throw new Error(`Post with cid ${cid} not found`)
    }

    if (!draft) {
      const published = await tx.posts.update({
        where: { cid },
        data: {
          status: 'publish',
          type: 'post'
        }
      })

      return {
        published,
        oldSlug: post.slug,
        newSlug: post.slug
      }
    }

    const newSlug = draft.slug?.replace(/^@/, '')
    if (!newSlug) {
      throw new Error(`Draft with cid ${draft.cid} has no valid slug`)
    }

    // 原文章主键保持不变，评论外键无需迁移。
    await tx.relationships.deleteMany({ where: { cid } })
    await tx.relationships.updateMany({
      where: { cid: draft.cid },
      data: { cid }
    })

    const published = await tx.posts.update({
      where: { cid },
      data: {
        title: draft.title,
        slug: newSlug,
        text: draft.text,
        order: draft.order,
        password: draft.password,
        allowComment: draft.allowComment,
        status: 'publish',
        type: 'post'
      }
    })

    await tx.posts.delete({
      where: { cid: draft.cid }
    })

    return {
      published,
      oldSlug: post.slug,
      newSlug
    }
  })

  clearPostRelatedCaches({
    cid,
    slugs: [result.oldSlug, result.newSlug]
  })

  return { success: true }
}
