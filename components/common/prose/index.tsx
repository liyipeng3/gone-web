import cn from 'classnames'
import React, { type FC } from 'react'

import parse from 'html-react-parser'
import Lightbox from './lightbox'

interface ProseProps {
  content: string
  className?: string
}

const Prose: FC<ProseProps> = ({
  content,
  className
}) => {
  return (
    <div className={cn('prose break-all text-left max-w-none dark:prose-invert', className)}>
      <main className="dark:text-gray-200 text-justify">{parse(content)}</main>
      <Lightbox/>
    </div>
  )
}

export default Prose
