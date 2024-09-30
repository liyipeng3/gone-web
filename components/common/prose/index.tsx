import cn from 'classnames'
import React, { type FC } from 'react'
import { parseEmoji } from '@/lib/emoji'

import parse, { type DOMNode, domToReact, type HTMLReactParserOptions } from 'html-react-parser'
import Lightbox from './lightbox'
import CopyButton from '@/components/common/button/copy'

interface ProseProps {
  content: string
  className?: string
}

// 递归函数，用于获取一个DOMNode对象的所有文本内容
function getText (node: DOMNode): string {
  if (node.type === 'text') {
    return node.data
  }

  if (node.type === 'tag' && node.children) {
    return node.children.map((node) => getText(node as DOMNode)).join('')
  }

  return ''
}

// const options: HTMLReactParserOptions = {
//   replace: (domNode) => {
//     if (domNode.type === 'tag' && domNode.tagName === 'pre' && domNode.children[0]?.type === 'tag' && domNode.children[0].tagName === 'code') {
//       const originalCode = getText(domNode.children[0])
//       return (
//         <div className="relative">
//           <pre>
//             {domToReact(domNode.children as DOMNode[], options)}
//           </pre>
//           <CopyButton text={originalCode} className="absolute right-2 top-2"/>
//         </div>
//       )
//     }
//   }
// }

const options: HTMLReactParserOptions = {
  replace: (domNode) => {
    if (domNode.type === 'tag' && domNode.tagName === 'pre' && domNode.children[0]?.type === 'tag' && domNode.children[0].tagName === 'code') {
      const originalCode = getText(domNode.children[0])
      return (
        <div className="relative">
          <pre>
            {domToReact(domNode.children as DOMNode[], options)}
          </pre>
          <CopyButton text={originalCode} className="absolute right-2 top-2"/>
        </div>
      )
    }
    if (domNode.type === 'text') {
      return <>{parseEmoji(domNode.data)}</>
    }
  }
}

const Prose: FC<ProseProps> = ({
  content,
  className
}) => {
  return (
    <div className={cn('prose break-all text-left max-w-none dark:prose-invert', className)}>
      <main className="dark:text-gray-200 text-justify">{parse(content, options)}</main>
      <Lightbox/>
    </div>
  )
}

export default Prose
