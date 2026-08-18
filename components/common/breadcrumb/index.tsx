import React from 'react'
import Link from 'next/link'

interface BreadcrumbProps {
  items: Array<{ name: string, href?: string }>
  className?: string
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className
}) => {
  // 不可变构造：避免对传入的 props 数组原地 unshift，
  // 否则复用同一数组时会重复插入「首页」。
  const list = [{ name: '首页', href: '/' }, ...items]
  return (
    <div className={`text-sm text-gray-500 dark:text-gray-400 mt-2 ${className}`}>
      {list.map((item, index) => {
        const {
          name,
          href
        } = item
        if (href == null) {
          return (
            <span key={index}>{name}</span>
          )
        } else {
          return (
            <React.Fragment key={index}>
              <Link href={href} className="no-underline text-gray-500 font-normal dark:text-gray-400">{name}</Link>
              {index !== list.length - 1 && <span> » </span>}
            </React.Fragment>
          )
        }
      })
      }
    </div>
  )
}

export default Breadcrumb
