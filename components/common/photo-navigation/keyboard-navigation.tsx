'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface KeyboardNavigationProps {
  previousUrl?: string
  nextUrl?: string
}

export default function KeyboardNavigation ({ previousUrl, nextUrl }: KeyboardNavigationProps) {
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && previousUrl) {
        event.preventDefault()
        router.push(previousUrl)
      } else if (event.key === 'ArrowRight' && nextUrl) {
        event.preventDefault()
        router.push(nextUrl)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => { document.removeEventListener('keydown', handleKeyDown) }
  }, [previousUrl, nextUrl, router])

  return null // 这个组件不渲染任何内容，只处理键盘事件
}
