import * as z from 'zod'

/**
 * 公开评论创建校验（POST /api/comment/[cid]）
 */
export const commentCreateSchema = z.object({
  author: z.string().min(1).max(200),
  text: z.string().min(1).max(5000),
  email: z.string().email().max(200),
  // 网站为选填，且允许用户不带协议直接填写域名（如 lyp123.com），仅限制长度
  url: z.string().max(200).optional().or(z.literal('')),
  parent: z.number().int().nonnegative().optional()
})

export type CommentCreateInput = z.infer<typeof commentCreateSchema>

/**
 * 管理员回复校验（POST /api/comment/[cid]，管理员分支）
 *
 * 作者身份由服务端 session 派生，客户端仅提供正文与被回复评论 id，
 * 避免信任客户端传入的 author/email。
 */
export const commentAdminReplySchema = z.object({
  text: z.string().min(1).max(5000),
  parent: z.number().int().positive()
})

export type CommentAdminReplyInput = z.infer<typeof commentAdminReplySchema>

/**
 * 评论更新校验（PATCH /api/comment/[cid]）
 *
 * 仅允许更新 status 与 text，防止管理员端把整个客户端对象写入 prisma.update
 * 造成质量赋值（Mass Assignment）——注入 cid/author/created/parent 等字段。
 * status/text 至少提供其一。
 */
export const commentUpdateSchema = z.object({
  coid: z.number().int().positive(),
  comment: z.object({
    status: z.enum(['approved', 'waiting', 'spam']).optional(),
    text: z.string().min(1).max(5000).optional()
  }).refine(
    (data) => data.status !== undefined || data.text !== undefined,
    { message: '至少需要提供 status 或 text' }
  )
})

export type CommentUpdateInput = z.infer<typeof commentUpdateSchema>

/**
 * 评论删除校验（DELETE /api/comment/[cid]）
 */
export const commentDeleteSchema = z.object({
  coid: z.number().int().positive()
})

export type CommentDeleteInput = z.infer<typeof commentDeleteSchema>

/**
 * 评论批量标记垃圾校验（PATCH /api/comment）
 *
 * coids 至少一项、至多 200 项，防止一次提交过大集合。
 */
export const commentBatchUpdateSchema = z.object({
  coids: z.array(z.number().int().positive()).min(1).max(200),
  status: z.literal('spam')
})

export type CommentBatchUpdateInput = z.infer<typeof commentBatchUpdateSchema>
