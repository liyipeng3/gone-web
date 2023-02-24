import dayjs, { type Dayjs } from 'dayjs'

export const getDurationTime: (fromTime: Dayjs) => string = (fromTime: Dayjs) => {
  const durationTime = dayjs.duration(dayjs().diff(fromTime))
  const years = durationTime.years()
  const days = Math.floor(durationTime.asDays() - years * 365)
  const hours = durationTime.hours()
  const minutes = durationTime.minutes()
  return `${years}年${days}天${hours}时${minutes}分`
}
