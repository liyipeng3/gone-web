'use client'

import React, { useState, useEffect } from 'react'
import { Link2 } from 'lucide-react'

interface ChapterItem {
  id: string
  title: string
  level: number
}

interface ChapterNavProps {
  contentSelector?: string
}

const ChapterNav: React.FC<ChapterNavProps> = ({ contentSelector = 'article' }) => {
  const [chapters, setChapters] = useState<ChapterItem[]>([])
  const [activeChapter, setActiveChapter] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // 获取文章内容区域
    const articleElement = document.querySelector(contentSelector)
    if (!articleElement) return

    // 获取所有标题元素
    const headings = articleElement.querySelectorAll('h1, h2, h3, h4, h5, h6')
    // 解析标题元素，生成章节数据
    const chaptersData: ChapterItem[] = []
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.substring(1))
      const title = heading.textContent ?? `章节 ${index + 1}`
      // 为标题元素添加ID，用于锚点跳转
      if (!heading.id) {
        heading.id = `heading-${index}`
      }
      chaptersData.push({
        id: heading.id,
        title,
        level
      })
    })
    setChapters(chaptersData)
    // 设置滚动监听，高亮当前章节
    const handleScroll = () => {
      if (chaptersData.length === 0) return
      const scrollPosition = window.scrollY + 100
      // 找到当前可见的章节
      for (let i = chaptersData.length - 1; i >= 0; i--) {
        const element = document.getElementById(chaptersData[i].id)
        if (element && element.offsetTop <= scrollPosition) {
          setActiveChapter(chaptersData[i].id)
          break
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    handleScroll() // 初始化时执行一次
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [contentSelector])

  // 如果没有章节，不显示组件
  if (chapters.length === 0) return null

  return (
    <div className="fixed right-[50%] mr-[-680px] top-32 z-40">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 max-w-[250px]">
        <div
          className="flex items-center justify-between cursor-pointer mb-2"
          onClick={() => { setIsOpen(!isOpen) }}
        >
          <h3 className="text-sm font-medium flex items-center">
            <Link2 size={16} className="mr-2" />
            文章目录
          </h3>
          <span className="text-xs text-gray-500">
            {isOpen ? '收起' : '展开'}
          </span>
        </div>
        {isOpen && (
          <nav className="mt-2 max-h-[50vh] overflow-y-auto">
            <ul className="space-y-1">
              {chapters.map((chapter) => {
                return (
                  <li
                    key={chapter.id}
                    className="text-sm"
                    style={{ paddingLeft: `${(chapter.level - 1) * 12}px` }}
                  >
                    <a
                      href={`#${chapter.id}`}
                      className={`block py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        activeChapter === chapter.id
                          ? 'bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                      onClick={(e) => {
                        e.preventDefault()
                        const element = document.getElementById(chapter.id)
                        if (element) {
                          window.scrollTo({
                            top: element.offsetTop - 80,
                            behavior: 'smooth'
                          })
                          setActiveChapter(chapter.id)
                        }
                      }}
                    >
                      {chapter.title}
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>
        )}
      </div>
    </div>
  )
}

export default ChapterNav
