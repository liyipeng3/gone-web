import { marked } from 'marked'

// 摘要默认截取的原文长度（<!--more--> 之前的部分）
const DEFAULT_EXCERPT_LENGTH = 150

/**
 * 从文章正文生成纯文本摘要。
 *
 * 规则：取 `<!--more-->` 之前的内容 -> 去除代码块 -> 截断 ->
 * 经 markdown 渲染后去除 HTML 标签，得到可直接展示的纯文本摘要。
 *
 * @param text 文章 markdown 正文
 * @param length 截取的原文长度，默认 150
 */
export const buildExcerpt = (text?: string | null, length: number = DEFAULT_EXCERPT_LENGTH): string => {
  if (!text) {
    return ''
  }

  const textPart = text
    .split('<!--more-->')[0]
    .replaceAll(/```(\n|\r|.)*?```/g, '')
    .slice(0, length)

  return (marked.parse(textPart) as string).replaceAll(/<.*?>/g, '')
}
