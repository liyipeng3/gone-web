'use client'
import React, { useState } from 'react'
import marked from '@/lib/marked'
import Prose from '@/components/common/prose'

const Editor = () => {
  const [content, setContent] = useState('')

  return (
    <div className="flex w-full h-full flex-1">
      <div>
        <textarea className="h-full w-[50vw] min-h-full resize-none py-4 px-4 focus:outline-0 border-r-2"
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value)
                  }}/>
      </div>
      <Prose content={marked.parse(content) as string} className="w-[50vw] text-left px-4"/>
    </div>
  )
}

export default Editor
