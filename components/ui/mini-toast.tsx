'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { createRoot } from 'react-dom/client'

interface MiniToastProps {
  message: string
  duration?: number
  position?: 'top' | 'bottom' | 'center'
  className?: string
  onClose?: () => void
}

const MiniToast: React.FC<MiniToastProps> = ({
  message,
  duration = 2000,
  position = 'center',
  className,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => {
        onClose?.()
      }, 300)
    }, duration)

    return () => {
      clearTimeout(timer)
    }
  }, [duration, onClose])

  const positionClasses = {
    top: 'top-4',
    center: 'top-1/2 -translate-y-1/2',
    bottom: 'bottom-4'
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            'fixed left-0 right-0 mx-auto w-auto max-w-[90vw] text-center z-50',
            positionClasses[position],
            className
          )}
          style={{
            width: 'fit-content'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.2
          }}
        >
          <div className="bg-gray-700/70 dark:bg-gray-800/70 text-white px-4 py-2 rounded-md shadow-lg text-sm font-medium backdrop-blur-sm inline-block">
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const toastContainerId = 'mini-toast-container'

interface ActiveToast {
  id: string
  timer?: ReturnType<typeof setTimeout>
  root?: ReturnType<typeof createRoot>
}

let activeToast: ActiveToast | null = null

const createToastContainer = () => {
  let container = document.getElementById(toastContainerId)
  if (container) return container

  container = document.createElement('div')
  container.id = toastContainerId
  container.style.position = 'fixed'
  container.style.top = '0'
  container.style.left = '0'
  container.style.width = '100%'
  container.style.height = '100%'
  container.style.pointerEvents = 'none'
  container.style.zIndex = '9999'
  document.body.appendChild(container)
  return container
}

const clearActiveToast = () => {
  if (activeToast) {
    if (activeToast.timer) {
      clearTimeout(activeToast.timer)
    }

    if (activeToast.root) {
      try {
        activeToast.root.unmount()
      } catch (e) {
        console.error('Error unmounting toast:', e)
      }
    }

    const activeElement = document.getElementById(activeToast.id)
    if (activeElement?.parentNode) {
      try {
        activeElement.parentNode.removeChild(activeElement)
      } catch (e) {
        console.error('Error removing toast element:', e)
      }
    }

    activeToast = null
  }
}

export const miniToast = {
  show: (
    message: string,
    options?: {
      duration?: number
      position?: 'top' | 'bottom' | 'center'
      className?: string
    }
  ) => {
    if (typeof window === 'undefined') return

    clearActiveToast()

    const container = createToastContainer()
    const toastId = `toast-${Date.now()}`
    const toastElement = document.createElement('div')
    toastElement.id = toastId
    toastElement.style.position = 'absolute'
    toastElement.style.left = '0'
    toastElement.style.right = '0'
    toastElement.style.textAlign = 'center'
    const position = options?.position ?? 'center'
    if (position === 'top') {
      toastElement.style.top = '1rem'
    } else if (position === 'center') {
      toastElement.style.top = '35%'
      toastElement.style.transform = 'translateY(-50%)'
    } else if (position === 'bottom') {
      toastElement.style.bottom = '1rem'
    }
    container.appendChild(toastElement)

    const root = createRoot(toastElement)
    const removeToast = () => {
      if (activeToast?.id === toastId) {
        if (toastElement.parentNode) {
          try {
            root.unmount()
            toastElement.parentNode.removeChild(toastElement)
          } catch (e) {
            console.error('Error cleaning up toast:', e)
          }
        }
        activeToast = null
      }

      const containerElement = document.getElementById(toastContainerId)
      if (containerElement && !containerElement.hasChildNodes()) {
        try {
          document.body.removeChild(containerElement)
        } catch (e) {
          console.error('Error removing toast container:', e)
        }
      }
    }

    activeToast = {
      id: toastId,
      root
    }

    const duration = options?.duration ?? 2000
    activeToast.timer = setTimeout(() => {
      removeToast()
    }, duration + 300)

    root.render(
      <MiniToast
        message={message}
        duration={duration}
        position={position}
        className={options?.className}
        onClose={removeToast}
      />
    )
  }
}

export default MiniToast
