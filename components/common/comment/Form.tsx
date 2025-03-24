'use client'
import { Textarea } from '@/components/ui/textarea'
import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { emojiMap } from '@/lib/emoji'
import { toast } from '@/components/ui/use-toast'
import Image from 'next/image'

interface CommentFormProps {
  cid: number
  parent?: number
  nameMap?: Record<number, string>
}

const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const CommentForm: React.FC<CommentFormProps> = ({ cid, parent, nameMap = {} }) => {
  const [text, setText] = useState('')
  const [mail, setMail] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')
  const [showEmojis, setShowEmojis] = useState(false)

  const handleSubmit = async () => {
    // 添加邮箱和名称的验证，邮箱需要符合邮箱格式
    if (!author || !mail || !text) {
      toast({
        title: '提交失败',
        variant: 'destructive',
        description: '请填写邮箱、名称和评论内容'
      })
      return
    }
    if (!validateEmail(mail)) {
      toast({
        title: '提交失败',
        variant: 'destructive',
        description: '请填写正确的邮箱格式'
      })
      return
    }
    await fetch(`/api/comment/${cid}`, {
      method: 'POST',
      body: JSON.stringify({
        author,
        mail,
        url,
        cid,
        parent: parent ?? 0,
        text
      })
    })
    toast({
      title: '提交成功',
      variant: 'success',
      description: '感谢您的评论，您的评论正等待审核！'
    })
    setText('')
    setMail('')
    setAuthor('')
    setUrl('')
  }

  return (
    <div className="flex flex-col gap-2">
      <Textarea placeholder={parent ? `回复 ${nameMap[parent]}：` : '来都来了，说点啥吧'} value={text} onChange={(e) => {
        setText(e.target.value)
      }} />
      <div className="flex flex-col gap-2">
        <button
          className="text-sm text-gray-600 cursor-pointer hover:text-gray-800 hover:bg-gray-200 rounded-md p-1 self-end"
          onClick={() => {
            setShowEmojis(!showEmojis)
          }}
        >
          {showEmojis ? '隐藏表情' : '显示表情'}
        </button>
        {showEmojis && (
          <div className="flex flex-row gap-2 flex-wrap justify-between ">
            {
              Object.keys(emojiMap).map((key) => {
                return <Image className='w-4 h-4 inline-block cursor-pointer hover:scale-110 emoji last:mr-auto'
                              width={16}
                              height={16}
                              onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                setText(text + ` :${key}: `)
                              }} key={key} src={emojiMap[key as keyof typeof emojiMap].src} alt={key} />
              })
            }
          </div>
        )}
      </div>
      <div className="flex flex-row gap-2">
        <Input placeholder="称呼 *" value={author} onChange={(e) => {
          setAuthor(e.target.value)
        }} />
        <Input placeholder="邮箱 *" value={mail} onChange={(e) => {
          setMail(e.target.value)
        }} />
        <Input placeholder="网站" value={url} onChange={(e) => {
          setUrl(e.target.value)
        }} />
      </div>
      <Button className='dark:bg-gray-800 dark:text-white hover:bg-gray-700 hover:dark:bg-gray-700'
              onClick={handleSubmit}>提交评论</Button>
    </div>
  )
}

export default CommentForm
