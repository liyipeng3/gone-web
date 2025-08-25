'use client'

import cn from 'classnames'
import type { IDialogPropTypes } from 'rc-dialog/lib/IDialogPropTypes'
import useMergedState from 'rc-util/lib/hooks/useMergedState'
import type { GetContainer } from 'rc-util/lib/PortalWrapper'
import * as React from 'react'
import { useContext, useMemo, useState } from 'react'
import { PreviewGroupContext } from './context'
import type { TransformType } from './hooks/useImageTransform'
import useRegisterImage from './hooks/useRegisterImage'
import useStatus from './hooks/useStatus'
import type { ImageElementProps } from './interface'
import type { PreviewProps, ToolbarRenderInfoType } from './Preview'
import Preview from './Preview'
import PreviewGroup from './PreviewGroup'
import { getOffset } from '@/lib/utils'

export interface ImagePreviewType
  extends Omit<
  IDialogPropTypes,
  'mask' | 'visible' | 'closable' | 'prefixCls' | 'onClose' | 'afterClose' | 'wrapClassName'
  > {
  src?: string
  visible?: boolean
  minScale?: number
  maxScale?: number
  onVisibleChange?: (value: boolean, prevValue: boolean) => void
  getContainer?: GetContainer | false
  mask?: React.ReactNode
  maskClassName?: string
  icons?: PreviewProps['icons']
  scaleStep?: number
  movable?: boolean
  imageRender?: (
    originalNode: React.ReactElement,
    info: { transform: TransformType },
  ) => React.ReactNode
  onTransform?: PreviewProps['onTransform']
  toolbarRender?: (
    originalNode: React.ReactElement,
    info: Omit<ToolbarRenderInfoType, 'current' | 'total'>,
  ) => React.ReactNode
}

export interface ImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'placeholder' | 'onClick'> {
  // Original
  src?: string
  wrapperClassName?: string
  wrapperStyle?: React.CSSProperties
  prefixCls?: string
  previewPrefixCls?: string
  placeholder?: React.ReactNode
  fallback?: string
  rootClassName?: string
  preview?: boolean | ImagePreviewType
  /**
   * @deprecated since version 3.2.1
   */
  onPreviewClose?: (value: boolean, prevValue: boolean) => void
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
}

interface CompoundedComponent<P> extends React.FC<P> {
  PreviewGroup: typeof PreviewGroup
}

const ImageInternal: CompoundedComponent<ImageProps> = props => {
  const {
    src: imgSrc,
    alt,
    onPreviewClose: onInitialPreviewClose,
    prefixCls = 'image-x',
    previewPrefixCls = `${prefixCls}-preview`,
    placeholder,
    fallback,
    width,
    height,
    style,
    preview = true,
    className,
    onClick,
    onError,
    wrapperClassName,
    wrapperStyle,
    rootClassName,

    ...otherProps
  } = props

  const isCustomPlaceholder = placeholder && placeholder !== true
  const {
    src: previewSrc,
    visible: previewVisible = undefined,
    onVisibleChange: onPreviewVisibleChange = onInitialPreviewClose,
    getContainer: getPreviewContainer = undefined,
    mask: previewMask,
    maskClassName,
    movable,
    icons,
    scaleStep,
    minScale,
    maxScale,
    imageRender,
    toolbarRender,
    ...dialogProps
  }: ImagePreviewType = typeof preview === 'object' ? preview : {}
  const src = previewSrc ?? imgSrc
  const [isShowPreview, setShowPreview] = useMergedState(!!previewVisible, {
    value: previewVisible,
    onChange: onPreviewVisibleChange
  })
  const [, srcAndOnload, status] = useStatus({
    src: imgSrc ?? '',
    isCustomPlaceholder: !!isCustomPlaceholder,
    fallback
  })
  const [mousePosition, setMousePosition] = useState<null | { x: number, y: number }>(null)

  const groupContext = useContext(PreviewGroupContext)

  const canPreview = Boolean(preview)

  const onPreviewClose = () => {
    setShowPreview(false)
    setMousePosition(null)
  }

  const wrapperClass = cn(prefixCls, wrapperClassName, rootClassName, {
    [`${prefixCls}-error`]: String(status) === 'error'
  })

  // ========================== Register ==========================
  const registerData: ImageElementProps = useMemo(
    () => ({
      src
    }),
    [src]
  )

  const imageId = useRegisterImage(canPreview, registerData)

  // ========================== Preview ===========================
  const onPreview: React.MouseEventHandler<HTMLDivElement> = e => {
    const imgEl = e.target as HTMLImageElement
    const { left, top } = getOffset(imgEl)
    const rect = imgEl.getBoundingClientRect()
    const centerX = left + rect.width / 2
    const centerY = top + rect.height / 2
    if (groupContext) {
      groupContext.onPreview(imageId, centerX, centerY)
    } else {
      setMousePosition({
        x: centerX,
        y: centerY
      })
      setShowPreview(true)
    }

    onClick?.(e)
  }

  // =========================== Render ===========================
  return (
    <>
      <div
        {...otherProps}
        className={wrapperClass}
        onClick={canPreview ? onPreview : onClick}
        style={{
          width,
          height,
          ...wrapperStyle
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={cn(
            `${prefixCls}-img`,
            {
              [`${prefixCls}-img-placeholder`]: placeholder === true
            },
            className
          )}
          style={{
            height,
            ...style
          }}
          {...srcAndOnload}
          width={width}
          height={height}
          onError={onError}
          alt=""
        />

        {String(status) === 'loading' && (
          <div aria-hidden="true" className={`${prefixCls}-placeholder`}>
            {placeholder}
          </div>
        )}

        {/* Preview Click Mask */}
        {previewMask && canPreview && (
          <div
            className={cn(`${prefixCls}-mask`, maskClassName)}
            style={{
              display: style?.display === 'none' ? 'none' : undefined
            }}
          >
            {previewMask}
          </div>
        )}
      </div>
      {!groupContext && canPreview && (
        <Preview
          aria-hidden={!isShowPreview}
          visible={isShowPreview}
          prefixCls={previewPrefixCls}
          onClose={onPreviewClose}
          mousePosition={mousePosition}
          src={src}
          alt={alt}
          fallback={fallback}
          getContainer={getPreviewContainer}
          icons={icons}
          movable={movable}
          scaleStep={scaleStep}
          minScale={minScale}
          maxScale={maxScale}
          rootClassName={rootClassName}
          imageRender={imageRender}
          toolbarRender={toolbarRender}
          {...dialogProps}
        />
      )}
    </>
  )
}

ImageInternal.PreviewGroup = PreviewGroup

ImageInternal.displayName = 'Image'

export default ImageInternal
