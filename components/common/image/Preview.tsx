import classnames from 'classnames'
import Dialog from 'rc-dialog'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { PreviewGroupContext } from './context'
import useImageTransform from './hooks/useImageTransform'
import useMouseEvent from './hooks/useMouseEvent'
import useTouchEvent from './hooks/useTouchEvent'
import Operations from './Operations'
import PreviewImage from './PreviewImage'
import { BASE_SCALE_RATIO } from './previewConfig'
import { addEventListener } from '@/lib/utils'
import type { PreviewProps, ToolbarRenderInfoType } from './Preview.types'

export type { PreviewProps, ToolbarRenderInfoType }

const Preview: React.FC<PreviewProps> = props => {
  const {
    prefixCls,
    src,
    alt,
    fallback,
    movable = true,
    onClose,
    visible,
    icons = {},
    rootClassName,
    closeIcon,
    getContainer,
    current = 0,
    count = 1,
    countRender,
    scaleStep = 0.5,
    minScale = 1,
    maxScale = 50,
    transitionName = 'zoom',
    maskTransitionName = 'fade',
    imageRender,
    imgCommonProps,
    toolbarRender,
    onTransform,
    onChange,
    ...restProps
  } = props

  const imgRef = useRef<HTMLImageElement>(null)
  const groupContext = useContext(PreviewGroupContext)
  const showLeftOrRightSwitches = groupContext && count > 1
  const showOperationsProgress = groupContext && count >= 1
  const [enableTransition, setEnableTransition] = useState(true)
  const {
    transform,
    resetTransform,
    updateTransform,
    dispatchZoomChange
  } = useImageTransform(
    imgRef,
    minScale,
    maxScale,
    onTransform
  )
  const {
    isMoving,
    onMouseDown,
    onWheel
  } = useMouseEvent(
    imgRef,
    movable,
    !!visible,
    scaleStep,
    transform,
    updateTransform,
    dispatchZoomChange
  )
  const {
    isTouching,
    onTouchStart,
    onTouchMove,
    onTouchEnd
  } = useTouchEvent(
    imgRef,
    movable,
    !!visible,
    minScale,
    transform,
    updateTransform,
    dispatchZoomChange
  )
  const {
    rotate,
    scale
  } = transform

  const wrapClassName = classnames({
    [`${prefixCls}-moving`]: isMoving
  })

  useEffect(() => {
    if (!enableTransition) {
      setEnableTransition(true)
    }
  }, [enableTransition])

  const onAfterClose = () => {
    resetTransform('close')
  }

  const onZoomIn = () => {
    dispatchZoomChange(BASE_SCALE_RATIO + scaleStep, 'zoomIn')
  }

  const onZoomOut = () => {
    dispatchZoomChange(BASE_SCALE_RATIO / (BASE_SCALE_RATIO + scaleStep), 'zoomOut')
  }

  const onRotateRight = () => {
    updateTransform({ rotate: rotate + 90 }, 'rotateRight')
  }

  const onRotateLeft = () => {
    updateTransform({ rotate: rotate - 90 }, 'rotateLeft')
  }

  const onFlipX = () => {
    updateTransform({ flipX: !transform.flipX }, 'flipX')
  }

  const onFlipY = () => {
    updateTransform({ flipY: !transform.flipY }, 'flipY')
  }

  const onSwitchLeft = (event?: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event?.preventDefault()
    event?.stopPropagation()
    if (current > 0) {
      setEnableTransition(false)
      resetTransform('prev')
      onChange?.(current - 1, current)
    }
  }

  const onSwitchRight = (event?: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event?.preventDefault()
    event?.stopPropagation()
    if (current < count - 1) {
      setEnableTransition(false)
      resetTransform('next')
      onChange?.(current + 1, current)
    }
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (!visible || !showLeftOrRightSwitches) return

    if (event.key === 'ArrowLeft') {
      onSwitchLeft()
    } else if (event.key === 'ArrowRight') {
      onSwitchRight()
    }
  }

  const onDoubleClick = (event: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    if (visible) {
      if (scale !== 1) {
        updateTransform({
          x: 0,
          y: 0,
          scale: 1
        }, 'doubleClick')
      } else {
        dispatchZoomChange(
          BASE_SCALE_RATIO + scaleStep,
          'doubleClick',
          event.clientX,
          event.clientY
        )
      }
    }
  }

  useEffect(() => {
    const onKeyDownListener = addEventListener(window, 'keydown', onKeyDown, false)

    return () => {
      onKeyDownListener.remove()
    }
  }, [visible, showLeftOrRightSwitches, current])

  const imgNode = (
    <PreviewImage
      {...imgCommonProps}
      width={props.width}
      height={props.height}
      imgRef={imgRef}
      className={`${prefixCls}-img`}
      alt={alt}
      style={{
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale3d(${
          transform.flipX ? '-' : ''
        }${scale}, ${transform.flipY ? '-' : ''}${scale}, 1) rotate(${rotate}deg)`,
        transitionDuration: (!enableTransition || isTouching) ? '0s' : ''
      }}
      fallback={fallback}
      src={src}
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    />
  )

  return (
    <>
      <Dialog
        transitionName={transitionName}
        maskTransitionName={maskTransitionName}
        closable={false}
        keyboard
        prefixCls={prefixCls}
        onClose={onClose}
        visible={visible}
        classNames={{
          wrapper: wrapClassName
        }}
        rootClassName={rootClassName}
        getContainer={getContainer}
        {...restProps}
        afterClose={onAfterClose}
      >
        <div className={`${prefixCls}-img-wrapper`}>
          {imageRender
            ? imageRender(imgNode, { transform, ...(groupContext ? { current } : {}) })
            : imgNode}
        </div>
      </Dialog>
      <Operations
        visible={visible}
        transform={transform}
        maskTransitionName={maskTransitionName}
        closeIcon={closeIcon}
        getContainer={getContainer}
        prefixCls={prefixCls}
        rootClassName={rootClassName}
        icons={icons}
        countRender={countRender}
        showSwitch={!!showLeftOrRightSwitches}
        showProgress={!!showOperationsProgress}
        current={current}
        count={count}
        scale={scale}
        minScale={minScale}
        maxScale={maxScale}
        onSwitchLeft={onSwitchLeft}
        onSwitchRight={onSwitchRight}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onRotateRight={onRotateRight}
        onRotateLeft={onRotateLeft}
        onFlipX={onFlipX}
        onFlipY={onFlipY}
        onClose={onClose}
        zIndex={restProps.zIndex !== undefined ? restProps.zIndex + 1 : undefined}
      />
    </>
  )
}

export default Preview
