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
 * 评论审核状态更新校验（PATCH /api/comment/[cid]）
 *
 * 仅允许更新 status，防止管理员端把整个客户端对象写入 prisma.update
 * 造成质量赋值（Mass Assignment）——注入 cid/author/created/parent 等字段。
 */
export const commentUpdateSchema = z.object({
  coid: z.number().int().positive(),
  comment: z.object({
    status: z.enum(['approved', 'waiting', 'spam'])
  })
})

export type CommentUpdateInput = z.infer<typeof commentUpdateSchema>

/**
 * 评论删除校验（DELETE /api/comment/[cid]）
 */
export const commentDeleteSchema = z.object({
  coid: z.number().int().positive()
})

export type CommentDeleteInput = z.infer<typeof commentDeleteSchema>
