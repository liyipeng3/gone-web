import cn from 'classnames'
import React, { type FC } from 'react'

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

const options: HTMLReactParserOptions = {
  replace: (domNode) => {
    if (domNode.type === 'tag' && domNode.tagName === 'code') {
      const originalCode = getText(domNode)
      return (

        <code {...domNode.attribs}>
          <CopyButton text={originalCode} className="float-right"/>
          {domToReact(domNode.children as DOMNode[], options)}
        </code>

      )
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
