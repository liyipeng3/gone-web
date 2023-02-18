import cn from 'classnames'
import { type FC } from 'react'

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
      <main className="dark:text-gray-200 text-justify"
            dangerouslySetInnerHTML={{ __html: content }}></main>
    </div>
  )
}

export default Prose
