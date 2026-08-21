// 相册表单共享的位置/标签纯逻辑
import { getCountries } from '@/lib/regions'

export interface ParsedLocation {
  country: string
  province: string
  city: string
}

/**
 * 将 "国家 · 省 · 市" 形式的位置字符串解析为结构化字段。
 */
export const parseLocationString = (location: string | null): ParsedLocation => {
  if (!location) {
    return { country: '中国', province: '', city: '' }
  }

  const parts = location.split('·').map(part => part.trim()).filter(Boolean)
  if (parts.length === 0) {
    return { country: '中国', province: '', city: '' }
  }

  if (parts.length === 1) {
    const singlePart = parts[0]
    const countries = getCountries()
    if (countries.includes(singlePart)) {
      return { country: singlePart, province: '', city: '' }
    }
    return { country: '中国', province: singlePart, city: '' }
  }

  if (parts.length === 2) {
    const countries = getCountries()
    if (countries.includes(parts[0])) {
      return { country: parts[0], province: parts[1], city: '' }
    }
    return { country: '中国', province: parts[0], city: parts[1] }
  }

  if (parts.length >= 3) {
    return { country: parts[0], province: parts[1], city: parts[2] }
  }

  return { country: '中国', province: '', city: '' }
}

/**
 * 将数据库中存储的标签 JSON 字符串安全解析为数组，脏数据时返回空数组。
 */
export const parseStoredTags = (tags: string | null): string[] => {
  if (!tags) return []
  try {
    const parsed = JSON.parse(tags)
    return Array.isArray(parsed) ? parsed as string[] : []
  } catch (error) {
    console.error('解析标签失败:', error)
    return []
  }
}

/**
 * 将逗号/空格分隔的标签字符串解析为去空标签数组。
 */
export const parseTags = (tagsString: string): string[] => {
  return tagsString
    .split(/[,，\s]+/)
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
}

/**
 * 拼接位置字段为 "国家 · 省 · 市" 字符串。
 */
export const joinLocation = (country?: string, province?: string, city?: string): string => {
  return [country, province, city].filter(Boolean).join(' · ')
}
