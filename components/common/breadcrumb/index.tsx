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
  items.unshift({
    name: '首页',
    href: '/'
  })
  return (
    <div className={`text-sm text-gray-500 dark:text-gray-400 mt-2 ${className}`}>
      {items.map((item, index) => {
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
              {index !== items.length - 1 && <span> » </span>}
            </React.Fragment>
          )
        }
      })
      }
    </div>
  )
}

export default Breadcrumb
