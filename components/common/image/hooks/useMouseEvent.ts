import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import getFixScaleEleTransPosition from '../getFixScaleEleTransPosition'
import { BASE_SCALE_RATIO, WHEEL_MAX_SCALE_RATIO } from '../previewConfig'
import type { DispatchZoomChangeFunc, TransformType, UpdateTransformFunc } from './useImageTransform'
import { addEventListener } from '@/lib/utils'

export default function useMouseEvent (
  imgRef: React.MutableRefObject<HTMLImageElement | null>,
  movable: boolean,
  visible: boolean,
  scaleStep: number,
  transform: TransformType,
  updateTransform: UpdateTransformFunc,
  dispatchZoomChange: DispatchZoomChangeFunc
) {
  const {
    rotate,
    scale,
    x,
    y
  } = transform

  const [isMoving, setMoving] = useState(false)
  const startPositionInfo = useRef({
    diffX: 0,
    diffY: 0,
    transformX: 0,
    transformY: 0
  })

  const onMouseDown: React.MouseEventHandler<HTMLDivElement> = (event) => {
    // Only allow main button
    if (!movable || event.button !== 0) return
    event.preventDefault()
    event.stopPropagation()
    startPositionInfo.current = {
      diffX: event.pageX - x,
      diffY: event.pageY - y,
      transformX: x,
      transformY: y
    }
    setMoving(true)
  }

  const onMouseMove: React.MouseEventHandler<HTMLBodyElement> = (event) => {
    if (visible && isMoving) {
      updateTransform(
        {
          x: event.pageX - startPositionInfo.current.diffX,
          y: event.pageY - startPositionInfo.current.diffY
        },
        'move'
      )
    }
  }

  const onMouseUp: React.MouseEventHandler<HTMLBodyElement> = () => {
    if (visible && isMoving) {
      setMoving(false)
      if (!imgRef.current) return

      /** No need to restore the position when the picture is not moved, So as not to interfere with the click */
      const {
        transformX,
        transformY
      } = startPositionInfo.current
      const hasChangedPosition = x !== transformX && y !== transformY
      if (!hasChangedPosition) return

      const width = imgRef.current.offsetWidth * scale
      const height = imgRef.current.offsetHeight * scale
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const {
        left,
        top
      } = imgRef.current.getBoundingClientRect()
      const isRotate = rotate % 180 !== 0

      const fixState = getFixScaleEleTransPosition(
        isRotate ? height : width,
        isRotate ? width : height,
        left,
        top
      )

      if (fixState) {
        updateTransform({ ...fixState }, 'dragRebound')
      }
    }
  }

  const onWheel = (event: React.WheelEvent<HTMLImageElement>) => {
    if (!visible || event.deltaY === 0) return
    // Scale ratio depends on the deltaY size
    const scaleRatio = Math.abs(event.deltaY / 100)
    // Limit the maximum scale ratio
    const mergedScaleRatio = Math.min(scaleRatio, WHEEL_MAX_SCALE_RATIO)
    // Scale the ratio each time
    let ratio = BASE_SCALE_RATIO + mergedScaleRatio * scaleStep
    if (event.deltaY > 0) {
      ratio = BASE_SCALE_RATIO / ratio
    }
    dispatchZoomChange(ratio, 'wheel', event.clientX, event.clientY)
  }

  useEffect(() => {
    // let onTopMouseUpListener: { remove: () => void }
    // let onTopMouseMoveListener: { remove: () => void }
    let onMouseUpListener: { remove: () => void }
    let onMouseMoveListener: { remove: () => void }

    if (movable) {
      onMouseUpListener = addEventListener(window, 'mouseup', onMouseUp, false)
      onMouseMoveListener = addEventListener(window, 'mousemove', onMouseMove, false)
    }

    return () => {
      onMouseUpListener?.remove()
      onMouseMoveListener?.remove()
      // /* istanbul ignore next */
      // onTopMouseUpListener?.remove()
      // /* istanbul ignore next */
      // onTopMouseMoveListener?.remove()
    }
  }, [visible, isMoving, x, y, rotate, movable])

  return {
    isMoving,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onWheel
  }
}
