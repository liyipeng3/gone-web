import dayjs, { type Dayjs } from 'dayjs'
import { twMerge } from 'tailwind-merge'
import { type ClassValue, clsx } from 'clsx'
import ReactDOM from 'react-dom'

export const getDurationTime: (fromTime: Dayjs) => string = (fromTime: Dayjs) => {
  const durationTime = dayjs.duration(dayjs().diff(fromTime))
  const years = durationTime.years()
  const days = Math.floor(durationTime.asDays() - years * 365)
  const hours = durationTime.hours()
  const minutes = durationTime.minutes()
  return `${years}年${days}天${hours}时${minutes}分`
}

export function cn (...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate (input: string | number): string {
  return dayjs(input).format('YYYY-MM-DD HH:mm:ss')
}

export function getClientSize () {
  const width = document.documentElement.clientWidth
  const height = window.innerHeight || document.documentElement.clientHeight
  return {
    width,
    height
  }
}

export function getOffset (node: HTMLElement) {
  const box = node.getBoundingClientRect()
  const docElem = document.documentElement

  // < ie8 不支持 win.pageXOffset, 则使用 docElem.scrollLeft
  return {
    left: box.left + (window.pageXOffset || docElem.scrollLeft) - (docElem.clientLeft || document.body.clientLeft || 0),
    top: box.top + (window.pageYOffset || docElem.scrollTop) - (docElem.clientTop || document.body.clientTop || 0)
  }
}

export function addEventListener (target: {
  addEventListener: (arg0: any, arg1: any, arg2: any) => void
  removeEventListener: (arg0: any, arg1: any, arg2: any) => void
}, eventType: any, cb: (a: any) => unknown, option: any) {
  /* eslint camelcase: 2 */
  const callback = ReactDOM.unstable_batchedUpdates
    ? function run (e: any) {
      ReactDOM.unstable_batchedUpdates(cb, e)
    }
    : cb
  if (target?.addEventListener) {
    target.addEventListener(eventType, callback, option)
  }
  return {
    remove: () => {
      if (target?.removeEventListener) {
        target.removeEventListener(eventType, callback, option)
      }
    }
  }
}
/**
 * 获取用户设备名称
 */

export function getUserAgent (agentStr: string): string {
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

export function getUserBrowser (agentStr: string): string {
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
