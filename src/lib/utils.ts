import dayjs, { type Dayjs } from 'dayjs'
import { twMerge } from 'tailwind-merge'
import { type ClassValue, clsx } from 'clsx'

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

// export function debounce<T extends ((args: any) => any) | ((args: any) => Promise<any>)> (fn: T, delay: number = 500): T {
//   let timer: any
//   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//   // @ts-expect-error
//   if (fn[Symbol(Symbol.toStringTag)] === 'AsyncFunction') {
//     return async function (this: any, ...args: any) {
//       return await new Promise<any>(resolve => {
//         clearTimeout(timer)
//         timer = setTimeout(() => {
//           resolve(fn.apply(this, args))
//         }, delay)
//       })
//     }
//   }
//   return function (this: any, ...args: any) {
//     clearTimeout(timer)
//     timer = setTimeout(() => {
//       fn.apply(this, args)
//     }, delay)
//   }
// }

export function formatDate (input: string | number): string {
  const date = new Date(input)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}
