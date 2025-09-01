'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import type { ImageProps } from 'next/image'
import { getFilter } from './util'

interface ProgressiveImageProps extends Omit<ImageProps, 'src'> {
  thumbnailSrc: string
  src: string
  blurIntensity?: number
}

const ProgressiveNextImage: React.FC<ProgressiveImageProps> = ({
  thumbnailSrc,
  src,
  blurIntensity = 10,
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
        overrideSrc={src}
        loading='eager'
        style={{
          display: display ? 'block' : 'none'
        }}
      />

      <Image
        {...imageProps}
        onLoad={handleLoad}
        src={thumbnailSrc}
        overrideSrc={thumbnailSrc}
        onError={(e) => {
          console.log('onError', e)
        }}
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

export default ProgressiveNextImage
