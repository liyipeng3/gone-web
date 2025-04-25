// 帖子标签和分类关系操作
import prisma from '@/lib/prisma'
import { clearPostRelatedCaches } from './cache-utils'
import { getDraftPostByCid } from './basic-operations'

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

    return relationshipData
  })
}

/**
 * 更新帖子标签
 */
export const updatePostTags = async (cid: number, tags: string[]) => {
  // 使用事务处理所有数据库操作，确保原子性
  return await prisma.$transaction(async (tx) => {
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

    // 清除相关缓存
    clearPostRelatedCaches({cid})

    return { success: true }
  })
}

/**
 * 更新帖子分类
 */
export const updatePostCategory = async (cid: number, category: string) => {
  // 使用事务处理所有数据库操作，确保原子性
  return await prisma.$transaction(async (tx) => {
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

    // 清除相关缓存
    clearPostRelatedCaches({cid})

    return { success: true }
  })
}

/**
 * 发布帖子
 */
export const publishPost = async (cid: number) => {
  // 使用事务处理所有数据库操作，确保原子性
  return await prisma.$transaction(async (tx) => {
    const draft = await getDraftPostByCid(cid)

    if (!draft) {
      // 如果没有草稿，直接更新状态
      await tx.posts.update({
        where: {
          cid
        },
        data: {
          status: 'publish',
          type: 'post'
        }
      })
    } else {
      // 如果有草稿，先获取原文章信息
      const post = await tx.posts.findUnique({
        where: {
          cid
        }
      })

      if (!post) {
        throw new Error(`Post with cid ${cid} not found`)
      }

      // 删除原文章
      await tx.posts.delete({
        where: {
          cid
        }
      })

      // 更新草稿为正式文章
      await tx.posts.update({
        where: {
          cid: draft.cid
        },
        data: {
          cid,
          status: 'publish',
          type: 'post',
          parent: 0,
          slug: String(draft?.slug).slice(1),
          created: post.created,
          commentsNum: post.commentsNum,
          viewsNum: post.viewsNum,
          likesNum: post.likesNum
        }
      })
    }

    // 清除相关缓存
    clearPostRelatedCaches({cid})

    return { success: true }
  })
}
