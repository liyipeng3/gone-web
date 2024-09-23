import React, { useState } from 'react'
import cypto from 'crypto'
import dayjs from 'dayjs'
import { emojiMap } from '@/lib/emoji'
import CommentForm from './CommentForm'

// 解析如 :smile: 的emoji 并转换为表情，输出为ReactNode，不能使用replace，用split分割空格也不对
function parseEmoji (text: string): React.ReactNode {
  const emojiRegex = /(:[a-zA-Z0-9_-]+:)/g
  return text.split(emojiRegex).map((part, index) => {
    if (part.startsWith(':') && part.endsWith(':')) {
      const emojiName = part.slice(1, -1) as keyof typeof emojiMap
      console.log(emojiName)
      const emoji = emojiMap[emojiName]
      // eslint-disable-next-line @next/next/no-img-element
      return emoji ? <img key={index} src={emoji.src} alt={emojiName} className="inline w-4 h-4"/> : null
    }
    return part
  })
}

/**
 * 获取用户设备名称
 */

function getUserAgent (agentStr: string): string {
  const strPattern = /Mozilla\/5.0\s*\([^()]*?(Windows[^()]*?|Android[^()]*?|Mac OS[^()]*?|iPhone)(\)|;\s*([^()]*?)\))/
  const arrMatches = agentStr.match(strPattern)
  let agent = arrMatches ? arrMatches[1] : ''
  agent = agent.replaceAll(/NT./g, '')
  agent = agent.replaceAll(/_/g, '.')

  return agent
}

/**
 * 获取用户浏览器类型
 */

function getUserBrowser (agentStr: string): string {
  const flag = agentStr
  let browser

  if (/Chrome\/[\d]*.[\d]*/.test(flag)) {
    // 检查Chrome
    browser = flag.match(/Chrome\/[\d]*.[\d]*/)?.[0]
  } else if (/Safari\/[\d]*.[\d]*/.test(flag)) {
    // 检查Safari
    browser = flag.match(/Safari\/[\d]*.[\d]*/)?.[0]
  } else if (/MSIE [\d]*.[\d]*/.test(flag)) {
    // IE
    browser = flag.match(/MSIE [\d]*.[\d]*/)?.[0]
  } else if (/Opera\/[\d]*.[\d]*/.test(flag)) {
    // opera
    browser = flag.match(/Opera\/[\d]*.[\d]*/)?.[0]
  } else if (/Firefox\/[\d]*.[\d]*/.test(flag)) {
    // Firefox
    browser = flag.match(/Firefox\/[\d]*.[\d]*/)?.[0]
  } else if (/OmniWeb\/(v*)([^\s|;]+)/i.test(flag)) {
    // OmniWeb
    browser = flag.match(/OmniWeb\/(v*)([^\s|;]+)/i)?.[2]
  } else if (/Netscape([\d]*)\/([^\s]+)/i.test(flag)) {
    // Netscape
    browser = flag.match(/Netscape([\d]*)\/([^\s]+)/i)?.[2]
  } else if (/Lynx\/([^\s]+)/i.test(flag)) {
    // Lynx
    browser = flag.match(/Lynx\/([^\s]+)/i)?.[1]
  } else if (/360SE/i.test(flag)) {
    // 360SE
    browser = '360安全浏览器'
  } else if (/SE 2.x/i.test(flag)) {
    // 搜狗
    browser = '搜狗浏览器'
  }

  return browser ?? 'unknown'
}

const CommentItem: React.FC<{ comment: any, layer?: number }> = ({
  comment,
  layer = 0
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false)
  return (
  <div className={`mb-4 p-4  ${layer % 2 === 0 ? 'bg-white' : 'bg-[#f2f7fc]'} rounded-md border border-solid border-gray-100 flex flex-col gap-2`}>
    <div className="flex gap-2 flex-row align-start">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="w-10 h-10 rounded-full"
           src={`https://cravatar.com/avatar/${cypto.createHash('md5').update(comment.mail).digest('hex')}?d=identicon`}
           alt={comment.author}/>
      <div>
        <div className="text-sm font-medium text-gray-700 gap-1 flex flex-row justify-start items-center flex-wrap">
          <span>{comment.author}</span>
          <span
            className="text-white whitespace-nowrap rounded-sm text-xs px-1.5 bg-[lightsteelblue]">{getUserBrowser(comment.agent)}</span>
          <span
            className="text-white whitespace-nowrap rounded-sm text-xs px-1.5 bg-[lightslategrey]">{getUserAgent(comment.agent)}</span>
        </div>
        <p className="text-sm text-gray-600">{dayjs(comment.created * 1000).format('YYYY-MM-DD HH:mm:ss')}</p>
      </div>
    </div>
    <p className="text-sm text-gray-600 relative">
      <span>{parseEmoji(comment.text)}</span>
      <span
        className="text-xs text-gray-400 cursor-pointer hover:text-gray-500 float-right items-end absolute right-0 bottom-0"
        onClick={() => { setShowReplyForm(!showReplyForm) }}
      >
        {showReplyForm ? '取消' : '回复'}
      </span>
    </p>
    {showReplyForm && (
      <div className="mt-4 bg-white p-4 rounded-md shadow-sm">
        <CommentForm cid={comment.cid} parent={comment.coid} />
      </div>
    )}
    {comment.children && comment.children.length > 0 && (
      <div className="ml-8 mt-4">
        {comment.children.map((childComment: any) => (
          <CommentItem key={childComment.coid} comment={childComment} layer={layer + 1}/>
        ))}
      </div>
    )}
  </div>
  )
}

export default CommentItem
