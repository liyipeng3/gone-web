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
  const date = new Date(input)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
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
