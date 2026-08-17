import * as z from 'zod'

export const postPatchSchema = z.object({
  title: z.string().min(3).max(128).optional(),

  // TODO: Type this properly from editorjs block types?
  content: z.any().optional()
})

/**
 * 文章保存（save 接口）服务端校验
 */
export const postSaveSchema = z.object({
  title: z.string().max(200).optional(),
  slug: z.string().max(200).optional(),
  text: z.string().optional(),
  type: z.enum(['post', 'page']).optional(),
  category: z.string().max(200).optional(),
  tags: z.array(z.string().max(200)).max(50).optional()
})

export type PostSaveInput = z.infer<typeof postSaveSchema>

export const postDraftSchema = z.object({
  // 新建文章后自动保存时，title/text/category 在库中可能为 null，
  // 用 nullish 允许 string | null | undefined，避免把原本正常的草稿自动保存打断
  title: z.string().max(200).nullish(),
  slug: z.string().min(1).max(200),
  text: z.string().nullish(),
  category: z.string().max(200).nullish(),
  tags: z.array(z.string().max(200)).max(50).default([])
})

export type PostDraftInput = z.infer<typeof postDraftSchema>
