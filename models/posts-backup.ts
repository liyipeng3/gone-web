// import prisma from '@/lib/prisma'
// import { marked } from 'marked'
// import { type HotList } from '@/types'
// import { cacheService, cacheKeys } from '@/lib/cache'

// export const getHotList = async (limit: number = 5): Promise<HotList> => {
//   const cacheKey = `${cacheKeys.hotList}:${limit}`
//   const cachedData = cacheService.get<HotList>(cacheKey)

//   if (cachedData) {
//     return cachedData
//   }

//   const hotData = await prisma.relationships.findMany({
//     include: {
//       posts: {
//         select: {
//           title: true,
//           slug: true
//         }
//       },
//       metas: {
//         select: {
//           slug: true
//         }
//       }
//     },
//     where: {
//       metas: {
//         type: 'category'
//       },
//       posts: {
//         status: 'publish',
//         type: 'post'
//       }
//     },
//     orderBy: {
//       posts: {
//         viewsNum: 'desc'
//       }
//     },
//     take: limit
//   })

//   const result = hotData.map((item: { posts: any, metas: { slug: any } }) => ({
//     ...item.posts,
//     category: item.metas.slug
//   })) as HotList

//   cacheService.set(cacheKey, result, 600)
//   return result
// }

// export const getPostBySlug = async (slug: string) => {
//   return await prisma.posts.findUnique({
//     include: {
//       relationships: {
//         include: {
//           metas: {
//             select: {
//               name: true,
//               slug: true,
//               type: true
//             }
//           }
//         }
//       }
//     },
//     where: {
//       slug
//     }
//   })
// }

// export const updateMetas = async (cid: number, category: string, tags: string[]) => {
//   // 使用事务处理所有数据库操作，确保原子性
//   return await prisma.$transaction(async (tx) => {
//     // 删除旧关系
//     await tx.relationships.deleteMany({
//       where: {
//         posts: {
//           cid
//         }
//       }
//     })

//     // 获取分类 mid
//     const categoryMeta = await tx.metas.findFirst({
//       where: {
//         slug: category,
//         type: 'category'
//       }
//     })

//     // 处理所有标签
//     const processedTagMids = []

//     // 逐个处理标签，避免使用 Promise.all
//     for (const tag of tags) {
//       const tagMeta = await tx.metas.findFirst({
//         where: {
//           slug: tag,
//           type: 'tag'
//         }
//       })

//       if (!tagMeta) {
//         // 创建新标签
//         const newTag = await tx.metas.create({
//           data: {
//             name: tag,
//             slug: tag,
//             type: 'tag',
//             count: 0
//           }
//         })
//         processedTagMids.push(newTag.mid)
//       } else {
//         processedTagMids.push(tagMeta.mid)
//       }
//     }

//     // 准备创建关系的数据
//     const relationshipData = [
//       ...processedTagMids.map(mid => ({ cid, mid })),
//       { cid, mid: categoryMeta?.mid }
//     ].filter(item => item.mid !== undefined)

//     // 使用 createMany 批量创建关系，替代循环创建
//     if (relationshipData.length > 0) {
//       await tx.relationships.createMany({
//         data: relationshipData.map(data => ({
//           cid: data.cid,
//           mid: data.mid as number
//         }))
//       })
//     }

//     return relationshipData
//   })
// }

// export const updatePost = async (cid: number, data: any) => {
//   return await prisma.posts.update({
//     where: {
//       cid
//     },
//     data
//   })
// }

// export const incrementViews = async (cid: number) => {
//   // 使用批处理更新视图计数，同时清除相关缓存
//   // 分开执行，避免在表达式中使用 void
//   await prisma.posts.update({
//     where: { cid },
//     data: {
//       viewsNum: {
//         increment: 1
//       }
//     }
//   })

//   // 清除热门文章缓存，因为视图计数变化会影响热门列表
//   cacheService.delByPrefix(cacheKeys.hotList)
// }

// export const getPostByCid = async (cid: number, draft?: boolean) => {
//   // 构建查询条件
//   const queries = [
//     prisma.posts.findUnique({
//       include: {
//         relationships: {
//           include: {
//             metas: {
//               select: {
//                 name: true,
//                 slug: true,
//                 type: true
//               }
//             }
//           }
//         }
//       },
//       where: {
//         cid
//       }
//     })
//   ]

//   // 如果需要草稿数据，添加草稿查询
//   if (draft) {
//     queries.push(
//       prisma.posts.findFirst({
//         where: {
//           parent: cid
//         },
//         include: {
//           relationships: {
//             include: {
//               metas: {
//                 select: {
//                   name: true,
//                   slug: true,
//                   type: true
//                 }
//               }
//             }
//           }
//         }
//       })
//     )
//   }

//   // 并行执行查询
//   const [post, draftPost] = await Promise.all(queries)

//   // 处理返回数据
//   let formattedDraftPost = null
//   if (draft && draftPost) {
//     formattedDraftPost = {
//       ...draftPost,
//       category: draftPost?.relationships?.find((item: {
//         metas: { type: string }
//       }) => item.metas.type === 'category')?.metas?.slug,
//       tags: draftPost?.relationships?.filter((item: {
//         metas: { type: string }
//       }) => item.metas.type === 'tag')?.map((item) => item.metas.slug)
//     }
//   }

//   return {
//     ...post,
//     draft: formattedDraftPost,
//     category: post?.relationships?.find((item: {
//       metas: { type: string }
//     }) => item.metas.type === 'category')?.metas?.slug,
//     tags: post?.relationships?.filter((item: {
//       metas: { type: string }
//     }) => item.metas.type === 'tag')?.map((item) => item.metas.slug)
//   }
// }

// export const getPostMids = async (cid: number) => {
//   const relationships = await prisma.relationships.findMany({
//     where: {
//       posts: {
//         cid
//       }
//     }
//   })
//   return relationships.map((item: { mid: any }) => item.mid)
// }

// export const getDraftPostByCid = async (cid: number) => {
//   return await prisma.posts.findFirst({
//     where: {
//       parent: cid
//     },
//     include: {
//       relationships: {
//         include: {
//           metas: {
//             select: {
//               name: true,
//               slug: true,
//               type: true
//             }
//           }
//         }
//       }
//     }
//   })
// }

// export const updatePostByCid = async (cid: number, data: any) => {
//   return await prisma.posts.update({
//     where: {
//       cid
//     },
//     data
//   })
// }

// export const deletePostByCid = async (cid: number) => {
//   return await prisma.posts.delete({
//     where: {
//       cid
//     }
//   })
// }

// export const createPost = async (data: any) => {
//   return await prisma.posts.create({
//     data: {
//       ...data
//     }
//   })
// }

// interface getPostListParams {
//   pageNum: number
//   pageSize?: number
//   mid?: number
//   search?: string
// }

// export const getPostList: (postListParams: getPostListParams) => Promise<any> = async ({
//   pageNum,
//   pageSize = 7,
//   mid,
//   search = ''
// }) => {
//   // 使用缓存键，包含所有查询参数
//   const cacheKey = `${cacheKeys.postList}:${pageNum}_${pageSize}_${mid ?? 'all'}_${search}`
//   const cachedData = cacheService.get(cacheKey)

//   // 如果缓存中有数据，直接返回
//   if (cachedData) {
//     return cachedData
//   }

//   // 构建查询条件
//   const whereCondition = {
//     metas: {
//       type: 'category'
//     },
//     posts: {
//       status: 'publish',
//       type: 'post'
//     }
//   } as any

//   // 只有在有搜索条件时才添加 OR 条件，避免不必要的复杂查询
//   if (search) {
//     whereCondition.posts.OR = [
//       { title: { contains: search } },
//       { text: { contains: search } }
//     ]
//   }

//   // 只有在指定分类时才添加 mid 条件
//   if (mid) {
//     whereCondition.metas.mid = mid
//   }

//   const data = await prisma.relationships.findMany({
//     include: {
//       posts: {
//         select: {
//           cid: true,
//           title: true,
//           slug: true,
//           created: true,
//           modified: true,
//           text: true,
//           viewsNum: true,
//           likesNum: true,
//           // 直接在这里包含评论数，减少额外的查询
//           _count: {
//             select: {
//               comments: {
//                 where: {
//                   status: 'approved'
//                 }
//               }
//             }
//           }
//         }
//       },
//       metas: {
//         select: {
//           name: true,
//           slug: true
//         }
//       }
//     },
//     where: whereCondition,
//     orderBy: {
//       posts: {
//         created: 'desc'
//       }
//     },
//     skip: (pageNum - 1) * pageSize,
//     take: pageSize
//   })

//   // 构建总数查询条件
//   const countWhereCondition = {
//     status: 'publish',
//     type: 'post',
//     relationships: {
//       some: {
//         metas: {}
//       }
//     }
//   } as any

//   if (search) {
//     countWhereCondition.OR = [
//       { title: { contains: search } },
//       { text: { contains: search } }
//     ]
//   }

//   if (mid) {
//     countWhereCondition.relationships.some.metas.mid = mid
//   }

//   const total = await prisma.posts.count({
//     where: countWhereCondition
//   })

//   // 处理数据，避免多次遍历
//   const list = data.map((item: any) => {
//     const post = item.posts
//     const commentsNum = post._count?.comments || 0

//     // 提取并处理描述
//     let description = ''
//     if (post.text) {
//       const textPart = post.text.split('<!--more-->')[0]
//         .replaceAll(/```(\n|\r|.)*?```/g, '')
//         .slice(0, 150)

//       description = (marked.parse(textPart) as string)?.replaceAll(/<.*?>/g, '')
//     }

//     return {
//       ...post,
//       category: item.metas.slug,
//       name: item.metas.name,
//       description,
//       commentsNum,
//       // 移除不需要的字段
//       _count: undefined
//     }
//   })

//   const result = {
//     list,
//     total
//   }

//   // 缓存结果，设置较短的缓存时间（2分钟）
//   cacheService.set(cacheKey, result, 120)

//   return result
// }

// export const updatePostTags = async (cid: number, tags: string[]) => {
//   // 使用事务处理所有数据库操作，确保原子性
//   return await prisma.$transaction(async (tx) => {
//     // 获取帖子当前的所有标签
//     const currentTags = await tx.relationships.findMany({
//       where: {
//         posts: {
//           cid
//         },
//         metas: {
//           type: 'tag'
//         }
//       },
//       include: {
//         metas: true
//       }
//     })

//     // 获取当前标签的 mid 列表
//     const currentTagMids = currentTags.map(tag => tag.metas.mid)

//     // 批量删除所有与该帖子相关的标签关系
//     if (currentTagMids.length > 0) {
//       await tx.relationships.deleteMany({
//         where: {
//           cid,
//           mid: {
//             in: currentTagMids
//           }
//         }
//       })
//     }

//     // 批量更新标签计数 - 减少旧标签计数
//     if (currentTagMids.length > 0) {
//       // 使用 updateMany 批量更新标签计数
//       await tx.metas.updateMany({
//         where: {
//           mid: {
//             in: currentTagMids
//           }
//         },
//         data: {
//           count: {
//             decrement: 1
//           }
//         }
//       })
//     }

//     // 处理新标签 - 收集需要创建的标签和关系
//     const newTagsToCreate = []
//     const existingTagMids = []
//     const relationshipsToCreate = []

//     // 先查找所有已存在的标签
//     const existingTags = await tx.metas.findMany({
//       where: {
//         slug: {
//           in: tags
//         },
//         type: 'tag'
//       }
//     })

//     // 创建已存在标签的映射
//     const existingTagMap = new Map()
//     existingTags.forEach(tag => {
//       existingTagMap.set(tag.slug, tag.mid)
//     })

//     // 处理每个标签
//     for (const tag of tags) {
//       if (existingTagMap.has(tag)) {
//         // 标签已存在，记录其 mid
//         const mid = existingTagMap.get(tag)
//         existingTagMids.push(mid)
//         relationshipsToCreate.push({
//           cid,
//           mid
//         })
//       } else {
//         // 标签不存在，需要创建
//         newTagsToCreate.push({
//           name: tag,
//           slug: tag,
//           type: 'tag',
//           count: 1
//         })
//       }
//     }

//     // 批量创建新标签
//     let newTagIds = []
//     if (newTagsToCreate.length > 0) {
//       // 注意：SQLite 不支持 createMany 和 returning，所以对于 SQLite 需要单独处理
//       // 这里假设使用的是支持 createMany 的数据库如 PostgreSQL 或 MySQL
//       const createdTags = await Promise.all(
//         newTagsToCreate.map(async tagData =>
//           await tx.metas.create({
//             data: tagData
//           })
//         )
//       )

//       // 收集新创建的标签 ID
//       newTagIds = createdTags.map(tag => tag.mid)

//       // 为新标签添加关系
//       newTagIds.forEach(mid => {
//         relationshipsToCreate.push({
//           cid,
//           mid
//         })
//       })
//     }

//     // 批量更新已存在标签的计数
//     if (existingTagMids.length > 0) {
//       await tx.metas.updateMany({
//         where: {
//           mid: {
//             in: existingTagMids
//           }
//         },
//         data: {
//           count: {
//             increment: 1
//           }
//         }
//       })
//     }

//     // 批量创建关系
//     if (relationshipsToCreate.length > 0) {
//       await tx.relationships.createMany({
//         data: relationshipsToCreate
//       })
//     }

//     // 清除相关缓存
//     cacheService.del(`${cacheKeys.post}:${cid}`)
//     cacheService.delByPrefix(cacheKeys.hotList)

//     return { success: true }
//   })
// }

// export const updatePostCategory = async (cid: number, category: string) => {
//   // 使用事务处理所有数据库操作，确保原子性
//   return await prisma.$transaction(async (tx) => {
//     // 获取当前分类
//     const currentCategory = await tx.relationships.findFirst({
//       where: {
//         posts: {
//           cid
//         },
//         metas: {
//           type: 'category'
//         }
//       },
//       include: {
//         metas: true
//       }
//     })

//     // 删除与该帖子相关的分类关系，并减少相应分类的count
//     if (currentCategory) {
//       await tx.relationships.delete({
//         where: {
//           cid_mid: {
//             cid,
//             mid: currentCategory.metas.mid
//           }
//         }
//       })

//       await tx.metas.update({
//         where: {
//           mid: currentCategory.metas.mid
//         },
//         data: {
//           count: {
//             decrement: 1
//           }
//         }
//       })
//     }

//     // 检查新分类是否已经存在
//     let existingCategory = await tx.metas.findUnique({
//       where: {
//         slug_type: {
//           slug: category,
//           type: 'category'
//         }
//       }
//     })

//     // 如果不存在则创建新的分类，否则更新计数
//     if (!existingCategory) {
//       existingCategory = await tx.metas.create({
//         data: {
//           name: category,
//           slug: category,
//           type: 'category',
//           count: 1
//         }
//       })
//     } else {
//       await tx.metas.update({
//         where: {
//           mid: existingCategory.mid
//         },
//         data: {
//           count: {
//             increment: 1
//           }
//         }
//       })
//     }

//     // 创建新的分类关系
//     await tx.relationships.create({
//       data: {
//         cid,
//         mid: existingCategory.mid
//       }
//     })

//     // 清除相关缓存
//     cacheService.del(`${cacheKeys.post}:${cid}`)
//     cacheService.delByPrefix(cacheKeys.hotList)

//     return { success: true }
//   })
// }

// export const publishPost = async (cid: number) => {
//   // 使用事务处理所有数据库操作，确保原子性
//   return await prisma.$transaction(async (tx) => {
//     const draft = await getDraftPostByCid(cid)

//     if (!draft) {
//       // 如果没有草稿，直接更新状态
//       await tx.posts.update({
//         where: {
//           cid
//         },
//         data: {
//           status: 'publish',
//           type: 'post'
//         }
//       })
//     } else {
//       // 如果有草稿，先获取原文章信息
//       const post = await tx.posts.findUnique({
//         where: {
//           cid
//         }
//       })

//       if (!post) {
//         throw new Error(`Post with cid ${cid} not found`)
//       }

//       // 删除原文章
//       await tx.posts.delete({
//         where: {
//           cid
//         }
//       })

//       // 更新草稿为正式文章
//       await tx.posts.update({
//         where: {
//           cid: draft.cid
//         },
//         data: {
//           cid,
//           status: 'publish',
//           type: 'post',
//           parent: 0,
//           slug: String(draft?.slug).slice(1),
//           created: post.created,
//           commentsNum: post.commentsNum,
//           viewsNum: post.viewsNum,
//           likesNum: post.likesNum
//         }
//       })
//     }

//     // 清除相关缓存
//     cacheService.del(`${cacheKeys.post}:${cid}`)
//     cacheService.delByPrefix(cacheKeys.hotList)
//     // 清除分页缓存
//     const cacheKeyPrefix = `${cacheKeys.postList}:`
//     const allKeys = cacheService.getAllKeys()
//     const keys = allKeys.filter((key: string) => key.startsWith(cacheKeyPrefix))
//     keys.forEach((key: string) => {
//       cacheService.del(key)
//     })

//     return { success: true }
//   })
// }

// export async function checkDraftSlugUnique (slug: string, excludeCid: number) {
//   const post = await prisma.posts.findUnique({
//     where: {
//       slug,
//       NOT: {
//         cid: excludeCid
//       }

//     }
//   })

//   return !post
// }

// export type ArchiveList = Array<{
//   time: string
//   posts: any
// }>

// export const getArchiveList: () => Promise<ArchiveList> = async () => {
//   const cacheKey = cacheKeys.archive
//   const cachedData = cacheService.get<ArchiveList>(cacheKey)

//   if (cachedData) {
//     return cachedData
//   }

//   const posts = await prisma.posts.findMany({
//     select: {
//       title: true,
//       slug: true,
//       created: true
//     },
//     where: {
//       status: 'publish',
//       type: 'post'
//     },
//     orderBy: {
//       created: 'desc'
//     }
//   })

//   // 按年月分组
//   const archiveMap = new Map()

//   posts.forEach(post => {
//     const date = new Date((post.created ?? 0) * 1000)
//     const time = `${date.getFullYear()} 年 ${String(date.getMonth() + 1).padStart(2, '0')} 月`

//     if (!archiveMap.has(time)) {
//       archiveMap.set(time, [])
//     }

//     archiveMap.get(time).push(post)
//   })

//   // 转换为数组格式
//   const result = Array.from(archiveMap.entries()).map(([time, posts]) => ({
//     time,
//     posts
//   }))

//   // 缓存结果，设置较长的过期时间（1小时）
//   cacheService.set(cacheKey, result, 3600)

//   return result
// }

// export const getPostInfoByCid = async (cid: number) => {
//   const post = await prisma.posts.findUnique({
//     include: {
//       relationships: {
//         include: {
//           metas: {
//             select: {
//               slug: true,
//               type: true
//             }
//           }
//         },
//         where: {
//           metas: {
//             type: 'category'
//           }
//         }
//       }
//     },
//     where: {
//       cid
//     }
//   })

//   if (!post) {
//     throw new Error('文章不存在')
//   }

//   const category = post.relationships[0]?.metas?.slug ?? 'uncategorized'

//   return {
//     title: post.title,
//     slug: post.slug,
//     category
//   }
// }
