import dayjs, { type Dayjs } from 'dayjs'

export const getDurationTime: (fromTime: Dayjs) => string = (fromTime: Dayjs) => {
  const durationTime = dayjs.duration(dayjs().diff(fromTime))
  const years = durationTime.years()
  const days = Math.floor(durationTime.asDays() - years * 365)
  const hours = durationTime.hours()
  const minutes = durationTime.minutes()
  return `${years}年${days}天${hours}时${minutes}分`
}

export const parseCookie: ((cookie: string) => Record<string, string>) = (cookie) => {
  const cookieObj: Record<string, string> = {}
  const cookieArr = cookie.split(';')
  cookieArr.forEach(item => {
    const [key, value] = item.split('=')
    cookieObj[key] = value
  })
  return cookieObj
}
