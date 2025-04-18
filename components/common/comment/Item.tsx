import React from 'react'
import dayjs from 'dayjs'
import { getAvatarUrl } from '@/lib/avatar'
import Reply from './Reply'
import { parseEmoji } from '@/lib/emoji'

/**
 * 获取用户设备名称
 */

function getUserAgent (agentStr: string): string {
  // 修改正则表达式，匹配 iPhone 设备并提取 iOS 版本号
  const strPattern = /Mozilla\/5.0\s*\([^()]*?(Windows[^()]*?|Android[^()]*?|Mac OS[^()]*?|(iPhone; CPU iPhone OS ([^()]*?) like Mac OS X))(\)|;\s*([^()]*?)\))/
  const arrMatches = agentStr.match(strPattern)
  let agent = arrMatches ? arrMatches[1] : ''

  // 如果是 iPhone 设备，则提取 iOS 版本号
  if (arrMatches?.[3]) {
    return 'iOS ' + arrMatches[3].replace(/_/g, '.')
  }

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

const CommentItem = ({ comment, nameMap }: { comment: any, nameMap: Record<number, string> }) => {
  return (
    <div
      id={`comment-${comment.coid}`}
      className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-md border border-solid border-gray-100 dark:border-gray-700 flex flex-col gap-2">
      <div className="flex gap-2 flex-row align-start">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="w-10 h-10 rounded-full"
             src={getAvatarUrl(comment.email)}
             alt={comment.author} />
        <div>
          <div
            className="text-sm text-gray-700 dark:text-gray-300 gap-1 flex flex-row justify-start items-center flex-wrap">
            <span>{comment.author}</span>
            {comment?.authorId === 1 && <span
                className="text-gray-700 dark:text-gray-300 whitespace-nowrap rounded-sm text-xs px-1.5 border border-solid border-gray-100 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">Author</span>}
            <span
              className="text-white whitespace-nowrap rounded-sm text-xs px-1.5 bg-[lightsteelblue] dark:bg-[#4682B4]">{getUserBrowser(comment.agent)}</span>
            <span
              className="text-white whitespace-nowrap rounded-sm text-xs px-1.5 bg-[lightslategrey] dark:bg-[#708090]">{getUserAgent(comment.agent)}</span>
          </div>
          <p
            className="text-sm text-gray-600 dark:text-gray-400">{dayjs(comment.created * 1000).format('YYYY-MM-DD HH:mm:ss')}</p>
        </div>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400 relative">
        {comment.parent ? <span className="font-bold">回复 {nameMap[comment.parent]}: </span> : null}
        <span>{parseEmoji(comment.text)}</span>
        <Reply comment={comment} nameMap={nameMap} />
      </div>
    </div>
  )
}

export default CommentItem
