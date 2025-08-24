'use client'

import React, { useState, useEffect } from 'react'
import Image from './Image'
import type { ImageProps } from './Image'

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
      return
    }

    const fullImage = new window.Image()
    fullImage.onload = () => {
      setIsFullImageLoaded(true)
    }
    fullImage.src = src
  }, [src, thumbnailSrc, isSameImage])

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // 只在第一次加载完成时触发 onLoad 事件
    if (onLoad && !hasTriggeredLoad) {
      setHasTriggeredLoad(true)
      onLoad(e)
    }
  }

  return (
        <>
            {/* 当缩略图和原图相同时，直接显示单张图片 */}
            {isSameImage || isFullImageLoaded
              ? (
                <Image
                    {...imageProps}
                    onLoad={handleLoad}
                    src={src}
                />
                )
              : (
                <Image
                    {...imageProps}
                    src={thumbnailSrc}
                    onLoad={handleLoad}
                    style={{
                      ...imageProps.style,
                      filter: `blur(${blurIntensity}px)`
                    }}
                />
                )}
        </>
  )
}

export default ProgressiveImage
