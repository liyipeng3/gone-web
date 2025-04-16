/**
 * 计算文本的预计阅读时间
 * @param text 文本内容
 * @param wordsPerMinute 每分钟阅读的字数，默认为 300
 * @returns 预计阅读时间（分钟）
 */
export function calculateReadingTime (text: string, wordsPerMinute: number = 300): number {
  // 移除 HTML 标签
  const cleanText = text.replace(/<\/?[^>]+(>|$)/g, '')

  // 计算字数（中文和英文单词）
  // 中文：每个字符算一个字
  // 英文：按空格分隔计算单词数
  const chineseCharCount = (cleanText.match(/[\u4e00-\u9fa5]/g) ?? []).length
  const englishWords = cleanText.replace(/[\u4e00-\u9fa5]/g, '').trim().split(/\s+/).filter(Boolean).length

  // 总字数（中文字符 + 英文单词）
  const totalWordCount = chineseCharCount + englishWords

  // 计算阅读时间（分钟）
  const minutes = totalWordCount / wordsPerMinute

  // 返回阅读时间，最小为 1 分钟
  return Math.max(1, Math.ceil(minutes))
}

/**
 * 获取文本总字数
 * @param text 文本内容
 * @returns 总字数
 */
export function getWordCount (text: string): number {
  // 移除 HTML 标签
  const cleanText = text.replace(/<\/?[^>]+(>|$)/g, '')

  // 计算字数（中文和英文单词）
  const chineseCharCount = (cleanText.match(/[\u4e00-\u9fa5]/g) ?? []).length
  const englishWords = cleanText.replace(/[\u4e00-\u9fa5]/g, '').trim().split(/\s+/).filter(Boolean).length

  // 总字数（中文字符 + 英文单词）
  return chineseCharCount + englishWords
}

/**
 * 格式化阅读时间
 * @param text 文本内容
 * @returns 格式化后的阅读时间字符串
 */
export function formatReadingTime (minutes: number, wordCount?: number): string {
  if (wordCount !== undefined) {
    return `约 ${wordCount} 字 阅读时间 ${minutes} 分钟`
  }
  return `预计阅读 ${minutes} 分钟`
}
