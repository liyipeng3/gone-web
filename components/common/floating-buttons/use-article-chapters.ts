'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export interface ChapterItem {
  id: string
  title: string
  level: number
}

/**
 * 解析文章标题生成章节目录，并跟踪滚动时的当前章节与回到顶部按钮显隐。
 */
export const useArticleChapters = () => {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [chapters, setChapters] = useState<ChapterItem[]>([])
  const [activeChapter, setActiveChapter] = useState<string>('')
  const [showChapters, setShowChapters] = useState(false)
  const pathname = usePathname()

  // 监听滚动：控制回到顶部按钮，并更新当前章节
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)

      if (chapters.length === 0) return
      const scrollPosition = window.scrollY + 100
      for (let i = chapters.length - 1; i >= 0; i--) {
        const element = document.getElementById(chapters[i].id)
        if (element && element.offsetTop <= scrollPosition) {
          setActiveChapter(chapters[i].id)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [chapters])

  // 路由变化时重新解析文章章节
  useEffect(() => {
    if (showChapters) {
      setShowChapters(false)
    }
    if (pathname.includes('/post/')) {
      const articleElement = document.querySelector('article')
      if (articleElement) {
        const headings = articleElement.querySelectorAll('h2, h3, h4, h5, h6')
        if (headings.length > 0) {
          const chapterData = Array.from(headings).map((heading, index) => {
            const id = heading.id || `chapter-${index}`
            if (!heading.id) {
              heading.id = id
            }
            return {
              id,
              title: heading.textContent ?? `章节 ${index + 1}`,
              level: parseInt(heading.tagName.substring(1))
            }
          })
          setChapters(chapterData)
        } else {
          setChapters([])
        }
      }
    } else {
      setChapters([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const scrollToChapter = useCallback((chapterId: string) => {
    const element = document.getElementById(chapterId)
    if (element) {
      window.scrollTo({ top: element.offsetTop - 80, behavior: 'smooth' })
      setActiveChapter(chapterId)
      setShowChapters(false)
    }
  }, [])

  return {
    showScrollTop,
    chapters,
    activeChapter,
    showChapters,
    setShowChapters,
    scrollToTop,
    scrollToChapter
  }
}
