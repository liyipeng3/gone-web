import React, { useState } from 'react'
import marked from '@utils/marked'

const Editor = () => {
  const [content, setContent] = useState('')

  return (
    <div className='flex justify-around'>
      <textarea value={content} onChange={(e) => setContent(e.target.value)}/>
      <div className='prose'>
        <main className='dark:text-gray-200' dangerouslySetInnerHTML={{ __html: marked.parse(content) }}></main>
      </div>
    </div>
  )
}

export default Editor
