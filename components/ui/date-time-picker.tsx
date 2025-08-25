'use client'

import * as React from 'react'
import { Calendar as CalendarIcon, ChevronDownIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import dayjs from 'dayjs'

interface DateTimePickerProps {
  value?: Date | null
  onChange: (date: Date | null) => void
  placeholder?: string
  className?: string
  error?: boolean
  label?: string
  required?: boolean
}

export function DateTimePicker ({
  value,
  onChange,
  placeholder = '选择日期和时间',
  className,
  error = false,
  label,
  required = false
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [timeValue, setTimeValue] = React.useState(
    value ? dayjs(value).format('HH:mm') : ''
  )

  React.useEffect(() => {
    if (value) {
      setTimeValue(dayjs(value).format('HH:mm'))
    } else {
      setTimeValue('')
    }
  }, [value])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const currentTime = timeValue.split(':')
      const hours = parseInt(currentTime[0]) || 0
      const minutes = parseInt(currentTime[1]) || 0

      const newDate = new Date(selectedDate)
      newDate.setHours(hours, minutes, 0, 0)

      onChange(newDate)
    } else {
      onChange(null)
    }
    setOpen(false)
  }

  const handleTimeChange = (time: string) => {
    setTimeValue(time)

    if (value && time) {
      const [hours, minutes] = time.split(':').map(Number)
      const newDate = new Date(value)
      newDate.setHours(hours, minutes, 0, 0)
      onChange(newDate)
    }
  }

  return (
    <>
      {label && (
        <Label className="px-1">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'flex-1 justify-start text-left font-normal',
                !value && 'text-muted-foreground',
                error && 'border-red-500 focus:border-red-500',
                className
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? dayjs(value).format('YYYY-MM-DD') : placeholder}
              <ChevronDownIcon className="ml-auto h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value ?? undefined}
              onSelect={handleDateSelect}
              captionLayout="dropdown"
              showOutsideDays={false}
            />
          </PopoverContent>
        </Popover>
        <Input
          type="time"
          step="1"
          defaultValue="10:30:00"

          value={timeValue}
          onChange={(e) => { handleTimeChange(e.target.value) }}
          className={cn(
            'w-32 bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none',
            error && 'border-red-500 focus:border-red-500'
          )}
          placeholder="时间"
        />
      </div>
    </>
  )
}
