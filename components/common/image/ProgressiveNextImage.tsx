'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import type { ImageProps } from 'next/image'

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
    if (!isFullImageLoaded) {
      setIsFullImageLoaded(true)
    }
    // 只在第一次加载完成时触发 onLoad 事件
    if (onLoad && !hasTriggeredLoad) {
      setHasTriggeredLoad(true)
      onLoad(e)
    }
  }

  return (
        <>

                <Image
                    {...imageProps}
                    onLoad={handleLoad}
                    alt=''
                    src={src}
                    overrideSrc={src}
                    style={{
                      display: isSameImage || isFullImageLoaded ? 'block' : 'none'
                    }}
                />

                <Image
                    {...imageProps}
                    onLoad={handleLoad}
                    src={thumbnailSrc}
                    overrideSrc={thumbnailSrc}
                    alt=''
                    style={{
                      ...imageProps.style,
                      filter: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='$'%3E%3CfeGaussianBlur stdDeviation='${blurIntensity}'/%3E%3CfeColorMatrix type='matrix' values='1 0 0 0 0,0 1 0 0 0,0 0 1 0 0,0 0 0 9 0'/%3E%3CfeComposite in2='SourceGraphic' operator='in'/%3E%3C/filter%3E%3C/svg%3E#$")`,
                      display: isSameImage || isFullImageLoaded ? 'none' : 'block'
                    }}
                />

        </>
  )
}

export default ProgressiveNextImage
