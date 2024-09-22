'use client'

import { useEffect, useState } from 'react'
import Image from '@/components/common/image'

import {
  CloseOutlined,
  LeftOutlined,
  RightOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from '@ant-design/icons'
import { type PreviewProps } from '@/components/common/image/Preview'
import { getOffset } from '@/lib/utils'

export const defaultIcons: PreviewProps['icons'] = {
  rotateLeft: <RotateLeftOutlined/>,
  rotateRight: <RotateRightOutlined/>,
  zoomIn: <ZoomInOutlined/>,
  zoomOut: <ZoomOutOutlined/>,
  close: <CloseOutlined/>,
  left: <LeftOutlined/>,
  right: <RightOutlined/>
}

const Lightbox = () => {
  const [images, setImages] = useState<string[]>([])
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState(0)
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0
  })

  useEffect(() => {
    document.querySelectorAll<HTMLImageElement>('img:not(.emoji)')?.forEach((img: HTMLImageElement, index: number) => {
      if (!img.src) return
      img.addEventListener('click', (e) => {
        setCurrent(index)
        const {
          left,
          top
        } = getOffset(e.target as HTMLImageElement)
        console.log(left, top)
        setMousePosition({
          x: left + img.width / 2,
          y: top + img.height / 2
        })
        setVisible(true)
      })
      if (images.includes(img.src)) return
      setImages(images => {
        if (images.includes(img.src)) {
          return images
        } else {
          return [...images, img.src]
        }
      })
    })
  }, [])

  return (
    <>
      <Image.PreviewGroup items={images} preview={{
        mousePosition,
        icons: defaultIcons,
        visible,
        onVisibleChange: value => {
          setVisible(value)
        },
        current,
        onChange: (current, prev) => {
          setCurrent(current)
        }
      }}>
      </Image.PreviewGroup>
    </>
  )
}

export default Lightbox
