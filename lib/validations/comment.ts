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
