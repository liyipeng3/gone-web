import React from 'react'
import useStatus from './hooks/useStatus'

interface PreviewImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string
  imgRef: React.MutableRefObject<HTMLImageElement | null>
}

const PreviewImage: React.FC<PreviewImageProps> = ({
  fallback,
  src,
  imgRef,
  ...props
}) => {
  const [getImgRef, srcAndOnload] = useStatus({
    src: src ?? '',
    fallback
  })

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref => {
        imgRef.current = ref
        if (!ref) return
        getImgRef(ref)
      }}
      alt=""
      {...props}
      {...srcAndOnload}
    />
  )
}

export default PreviewImage
