import { describe, expect, it } from 'vitest'
import { galleryCreateSchema, galleryUpdateSchema } from '@/lib/validations/gallery'

describe('galleryCreateSchema', () => {
  it('accepts an upload body whose EXIF/GPS fields are null', () => {
    // 上传接口对无 GPS 的相机照片会把 latitude/longitude/lens/iso/takenAt 等显式回传 null，
    // 前端用 ...exif 原样提交。schema 必须放行这些 null，否则大量真实照片无法上传（400）。
    const result = galleryCreateSchema.safeParse({
      imagePath: 'https://example.com/photo.jpg',
      isPublic: true,
      camera: 'SONY ILCE-7M3',
      width: 6000,
      height: 4000,
      latitude: null,
      longitude: null,
      lens: null,
      focalLength: null,
      aperture: null,
      shutterSpeed: null,
      iso: null,
      location: null,
      takenAt: null
    })

    expect(result.success).toBe(true)
    if (result.success) {
      // takenAt 的空值统一归一化为 undefined
      expect(result.data.takenAt).toBeUndefined()
      // isPublic 缺省逻辑保留
      expect(result.data.isPublic).toBe(true)
    }
  })

  it('normalizes a numeric takenAt as unix seconds (×1000)', () => {
    const result = galleryCreateSchema.safeParse({
      imagePath: 'https://example.com/photo.jpg',
      takenAt: 1_700_000_000
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.takenAt).toEqual(new Date(1_700_000_000 * 1000))
    }
  })

  it('treats takenAt=0 as "no time" (undefined), not 1970 epoch', () => {
    // 旧路由用 `if (body.takenAt)` 判定，0 会被跳过；schema 需保持一致，
    // 避免把异常回退的 0 静默写成 1970-01-01 的错误拍摄时间。
    const result = galleryCreateSchema.safeParse({
      imagePath: 'https://example.com/photo.jpg',
      takenAt: 0
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.takenAt).toBeUndefined()
    }
  })

  it('normalizes empty-string takenAt to undefined', () => {
    const result = galleryCreateSchema.safeParse({
      imagePath: 'https://example.com/photo.jpg',
      takenAt: ''
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.takenAt).toBeUndefined()
    }
  })

  it('defaults isPublic to true when omitted', () => {
    const result = galleryCreateSchema.safeParse({
      imagePath: 'https://example.com/photo.jpg'
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.isPublic).toBe(true)
    }
  })

  it('rejects a body without imagePath', () => {
    const result = galleryCreateSchema.safeParse({ title: '无图' })

    expect(result.success).toBe(false)
  })
})

describe('galleryUpdateSchema', () => {
  it('accepts a partial update carrying null fields', () => {
    const result = galleryUpdateSchema.safeParse({
      isPublic: false,
      location: null,
      takenAt: null
    })

    expect(result.success).toBe(true)
  })
})
