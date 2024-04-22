import * as React from 'react'
import type { ImageElementProps, InternalItem, PreviewImageElementProps, RegisterImage } from '../interface'
import type { GroupConsumerProps } from '../PreviewGroup'

export type Items = Array<Omit<InternalItem, 'canPreview'>>

/**
 * Merge props provided `items` or context collected images
 */
export default function usePreviewItems (
  items?: GroupConsumerProps['items']
): [items: Items, registerImage: RegisterImage] {
  // Context collection image data
  const [images, setImages] = React.useState<Record<number, PreviewImageElementProps>>({})

  const registerImage = React.useCallback<RegisterImage>((id, data) => {
    setImages(imgs => ({
      ...imgs,
      [id]: data
    }))

    return () => {
      setImages(imgs => {
        const cloneImgs: any = { ...imgs }
        cloneImgs[id] = undefined

        return cloneImgs
      })
    }
  }, [])

  // items
  const mergedItems = React.useMemo<Items>(() => {
    if (items) {
      return items.map(item => {
        if (typeof item === 'string') {
          return { data: { src: item } }
        }
        const data: ImageElementProps = item

        return { data }
      })
    }

    return Object.keys(images).reduce((total: Items, id) => {
      const {
        canPreview,
        data
      } = images[Number(id)]
      if (canPreview) {
        total.push({
          data,
          id
        })
      }
      return total
    }, [])
  }, [items, images])

  return [mergedItems, registerImage]
}
