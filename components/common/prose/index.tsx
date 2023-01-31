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
    <div className={cn('prose text-left max-w-none dark:prose-invert dark:prose-pre:bg-[#1f2937]', className)}>
      <main className="dark:text-gray-200 prose-code-custom"
            dangerouslySetInnerHTML={{ __html: content }}></main>
    </div>
  )
}

export default Prose
