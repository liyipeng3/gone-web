import * as z from 'zod'

const galleryPublicQuerySchema = z.object({
  category: z.string().max(100).optional(),
  tag: z.string().max(100).optional(),
  limit: z.coerce.number().int().min(1).transform(value => Math.min(value, 100)).catch(20),
  offset: z.coerce.number().int().transform(value => Math.max(value, 0)).catch(0),
  orderBy: z.enum(['createdAt', 'takenAt', 'order']).catch('createdAt'),
  orderDirection: z.enum(['asc', 'desc']).catch('desc')
})

export const parseGalleryPublicQuery = (searchParams: URLSearchParams) => {
  return galleryPublicQuerySchema.parse({
    category: searchParams.get('category') ?? undefined,
    tag: searchParams.get('tag') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    offset: searchParams.get('offset') ?? undefined,
    orderBy: searchParams.get('orderBy') ?? undefined,
    orderDirection: searchParams.get('orderDirection') ?? undefined
  })
}

/**
 * takenAt 归一化：兼容数字（Unix 秒级时间戳）、字符串、Date，空值（null/undefined/''/0）统一为 undefined。
 * 保留原路由手写转换的语义：旧代码用 `if (body.takenAt)` 判定，0 视为“无时间”而非 1970 epoch。
 * 数字按秒 ×1000。
 */
const galleryTakenAtSchema = z
  .union([z.number(), z.string(), z.date()])
  .nullish()
  .transform((value) => {
    if (value === undefined || value === null || value === '' || value === 0) return undefined
    if (typeof value === 'number') return new Date(value * 1000)
    if (value instanceof Date) return value
    return new Date(value)
  })

/**
 * 相册写入字段（create 与 update 共用的可选部分）。
 *
 * 均使用 nullish 接受 null：上传接口（/api/upload/image）在缺少对应 EXIF/GPS 信息时
 * 会显式回传 null（如无 GPS 的相机照片），这些列在数据库中均可空，null 需原样落库。
 */
const galleryWritableFields = {
  title: z.string().nullish(),
  description: z.string().nullish(),
  thumbnailPath: z.string().nullish(),
  category: z.string().nullish(),
  tags: z.array(z.string()).nullish(),
  location: z.string().nullish(),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
  takenAt: galleryTakenAtSchema,
  width: z.number().nullish(),
  height: z.number().nullish(),
  fileSize: z.number().nullish(),
  mimeType: z.string().nullish(),
  camera: z.string().nullish(),
  lens: z.string().nullish(),
  focalLength: z.string().nullish(),
  aperture: z.string().nullish(),
  shutterSpeed: z.string().nullish(),
  iso: z.number().nullish(),
  order: z.number().nullish()
}

/**
 * 创建相册项（POST /api/gallery）。imagePath 必填，isPublic 缺省为 true。
 */
export const galleryCreateSchema = z.object({
  imagePath: z.string().min(1, '图片路径不能为空'),
  isPublic: z.boolean().default(true),
  ...galleryWritableFields
})

export type GalleryCreateBody = z.infer<typeof galleryCreateSchema>

/**
 * 更新相册项（PATCH /api/gallery/[gid]）。全部字段可选，isPublic 不设默认值。
 */
export const galleryUpdateSchema = z.object({
  imagePath: z.string().min(1).optional(),
  isPublic: z.boolean().optional(),
  ...galleryWritableFields
})

export type GalleryUpdateBody = z.infer<typeof galleryUpdateSchema>
