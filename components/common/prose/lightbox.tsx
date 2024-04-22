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

  useEffect(() => {
    document.querySelectorAll('img')?.forEach((img, index) => {
      if (!img.src) return
      console.log(img)
      img.addEventListener('click', () => {
        setCurrent(index)
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
