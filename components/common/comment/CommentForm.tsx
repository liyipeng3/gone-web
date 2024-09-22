import { Textarea } from '@/components/ui/textarea'
import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { emojiMap } from '@/lib/emoji'
interface CommentFormProps {
  cid: number
  parent?: number
}

const CommentForm: React.FC<CommentFormProps> = ({ cid, parent }) => {
  const [comment, setComment] = useState('')
  const [mail, setMail] = useState('')
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [showEmojis, setShowEmojis] = useState(false)

  const handleSubmit = async () => {
    await fetch('/api/comment', {
      method: 'POST',
      body: JSON.stringify({
        cid,
        parent,
        comment
      })
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <Textarea placeholder="来都来了，说点啥吧" value={comment} onChange={(e) => { setComment(e.target.value) }}/>
      <div className="flex flex-col gap-2">
        <button
          className="text-sm text-gray-600 cursor-pointer hover:text-gray-800 hover:bg-gray-200 rounded-md p-1 self-end"
          onClick={() => { setShowEmojis(!showEmojis) }}
        >
          {showEmojis ? '隐藏表情' : '显示表情'}
        </button>
        {showEmojis && (
          <div className="flex flex-row gap-2 flex-wrap">
            {
              Object.keys(emojiMap).map((key) => {
                return <img className='w-4 h-4 inline-block cursor-pointer hover:scale-110 emoji'
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  setComment(comment + ` :${key}: `)
                }} key={key} src={emojiMap[key as keyof typeof emojiMap].src} alt={key} />
              })
            }
          </div>
        )}
      </div>
      <div className="flex flex-row gap-2">
        <Input placeholder="称呼 *" value={name} onChange={(e) => { setName(e.target.value) }}/>
        <Input placeholder="邮箱 *" value={mail} onChange={(e) => { setMail(e.target.value) }}/>
        <Input placeholder="网站" value={url} onChange={(e) => { setUrl(e.target.value) }}/>
      </div>
      <Button onClick={handleSubmit}>提交评论</Button>
    </div>
  )
}

export default CommentForm
