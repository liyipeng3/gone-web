'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface GalleryFilterProps {
  categories: string[]
  currentCategory?: string
  currentTag?: string
}

const GalleryFilter: React.FC<GalleryFilterProps> = ({
  categories,
  currentCategory,
  currentTag
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [tags, setTags] = useState<string[]>([])

  // 获取所有标签
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/gallery/tags')
        if (response.ok) {
          const tagsData = await response.json()
          setTags(tagsData)
        }
      } catch (error) {
        console.error('获取标签失败:', error)
      }
    }

    void fetchTags()
  }, [])

  // 更新URL参数
  const updateSearchParams = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    // 重置页码
    params.delete('page')

    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.push(newUrl)
  }

  // 分类过滤
  const handleCategoryFilter = (category: string | null) => {
    if (category) {
      router.push(`/gallery/${category}`)
    } else {
      router.push('/gallery')
    }
  }

  // 标签过滤
  const handleTagFilter = (tag: string | null) => {
    updateSearchParams('tag', tag)
  }

  // 清除所有过滤器
  const clearFilters = () => {
    router.push('/gallery')
  }

  return (
    <div className="mb-6 space-y-4">
      {/* 分类过滤器 */}
      {categories.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            分类
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={!currentCategory ? 'default' : 'outline'}
              size="sm"
              onClick={() => { handleCategoryFilter(null) }}
            >
              全部
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={currentCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => { handleCategoryFilter(category) }}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* 标签过滤器 */}
      {tags.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            标签
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={!currentTag ? 'default' : 'outline'}
              size="sm"
              onClick={() => { handleTagFilter(null) }}
            >
              全部
            </Button>
            {tags.slice(0, 10).map((tag) => (
              <Button
                key={tag}
                variant={currentTag === tag ? 'default' : 'outline'}
                size="sm"
                onClick={() => { handleTagFilter(tag) }}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* 清除过滤器 */}
      {(currentCategory ?? currentTag) && (
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            清除所有过滤器
          </Button>
        </div>
      )}
    </div>
  )
}

export default GalleryFilter
