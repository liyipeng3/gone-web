import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface PaginationProps {
  totalItems: number
  currentPage: number
  pageSize: number
  baseUrl: string
}

export function Pagination ({
  totalItems,
  currentPage,
  pageSize,
  baseUrl
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize)

  if (totalPages <= 1) {
    return null
  }

  // 生成页码数组，最多显示5个页码
  const generatePagination = () => {
    const pages = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      // 如果总页数少于或等于要显示的最大页数，则显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 总是显示第一页和最后一页
      // 当前页附近的页码也要显示
      const leftSiblingIndex = Math.max(currentPage - 1, 1)
      const rightSiblingIndex = Math.min(currentPage + 1, totalPages)

      // 是否显示左边的省略号
      const shouldShowLeftDots = leftSiblingIndex > 2
      // 是否显示右边的省略号
      const shouldShowRightDots = rightSiblingIndex < totalPages - 1

      if (!shouldShowLeftDots && shouldShowRightDots) {
        // 显示前三页和最后一页，中间用省略号
        for (let i = 1; i <= 3; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (shouldShowLeftDots && !shouldShowRightDots) {
        // 显示第一页和最后三页，中间用省略号
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(i)
        }
      } else if (shouldShowLeftDots && shouldShowRightDots) {
        // 显示第一页、当前页及其相邻页、最后一页，两边用省略号
        pages.push(1)
        pages.push('...')
        pages.push(leftSiblingIndex)
        pages.push(currentPage)
        pages.push(rightSiblingIndex)
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pages = generatePagination()

  // 构建带有查询参数的URL
  const getPageUrl = (page: number) => {
    const url = new URL(baseUrl, 'http://example.com')
    url.searchParams.set('page', page.toString())
    return `${url.pathname}${url.search}`
  }

  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      {currentPage > 1
        ? (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          aria-label="上一页"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
          )
        : (
        <span className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-muted-foreground opacity-50">
          <ChevronLeft className="h-4 w-4" />
        </span>
          )}

      {pages.map((page, i) => {
        if (page === '...') {
          return (
            <span
              key={`ellipsis-${i}`}
              className="inline-flex h-9 w-9 items-center justify-center text-sm"
            >
              ...
            </span>
          )
        }

        return (
          <Link
            key={`page-${page}`}
            href={getPageUrl(page as number)}
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors',
              page === currentPage
                ? 'bg-primary text-primary-foreground'
                : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
            )}
          >
            {page}
          </Link>
        )
      })}

      {currentPage < totalPages
        ? (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          aria-label="下一页"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
          )
        : (
        <span className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-muted-foreground opacity-50">
          <ChevronRight className="h-4 w-4" />
        </span>
          )}
    </div>
  )
}
