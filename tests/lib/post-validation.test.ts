import { describe, expect, it } from 'vitest'
import { postDraftSchema } from '@/lib/validations/post'

describe('postDraftSchema', () => {
  it('accepts a freshly created post whose nullable fields are still null', () => {
    // 新建文章后仅生成 slug 触发自动保存时，title/text/category 在库中仍为 null，
    // 校验必须放行，否则会把原本正常的草稿自动保存打断（返回 400）
    const result = postDraftSchema.safeParse({
      title: null,
      slug: 'my-new-post',
      text: null,
      category: null
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.tags).toEqual([])
    }
  })

  it('still accepts fully populated drafts', () => {
    const result = postDraftSchema.safeParse({
      title: '标题',
      slug: 'title',
      text: '正文',
      category: '默认分类',
      tags: ['a', 'b']
    })

    expect(result.success).toBe(true)
  })

  it('rejects a draft without a slug', () => {
    const result = postDraftSchema.safeParse({
      title: '标题',
      text: '正文'
    })

    expect(result.success).toBe(false)
  })
})
