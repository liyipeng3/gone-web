'use client'

import React, { useState, useEffect } from 'react'
import Image from './Image'
import type { ImageProps } from './Image'
import { getFilter } from './util'

interface ProgressiveImageProps extends Omit<ImageProps, 'src'> {
  thumbnailSrc: string
  src: string
  blurIntensity?: number
}

const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  thumbnailSrc,
  src,
  blurIntensity = 20,
  onLoad,
  ...imageProps
}) => {
  const [isFullImageLoaded, setIsFullImageLoaded] = useState(false)
  const [hasTriggeredLoad, setHasTriggeredLoad] = useState(false)
  const isSameImage = src === thumbnailSrc

  useEffect(() => {
    if (!src || isSameImage) {
      setIsFullImageLoaded(true)
    }
  }, [src, thumbnailSrc, isSameImage])

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // 只在第一次加载完成时触发 onLoad 事件
    if (onLoad && !hasTriggeredLoad) {
      setHasTriggeredLoad(true)
      onLoad(e)
    }
  }

  const display = isSameImage || isFullImageLoaded

  return (
        <>

                <Image
                    {...imageProps}
                    onLoad={(e) => { setIsFullImageLoaded(true); handleLoad(e) }}
                    alt=''
                    src={src}
                    style={{
                      ...imageProps.style,
                      display: display ? 'block' : 'none'
                    }}
                />

                <Image
                    {...imageProps}
                    src={thumbnailSrc}
                    onLoad={handleLoad}
                    alt=''
                    style={{
                      ...imageProps.style,
                      filter: getFilter(blurIntensity),
                      display: display ? 'none' : 'block'
                    }}
                />

        </>
  )
}

export default ProgressiveImage
