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

export function formatDate (input: string | number): string {
  const date = new Date(input)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}
