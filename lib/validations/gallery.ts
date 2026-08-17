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
