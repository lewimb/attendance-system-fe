import { useState, type Ref } from 'react'
import { CalendarDays } from 'lucide-react'
import type { Matcher } from 'react-day-picker'
import { businessToday, formatCalendarDate, localDateToYmd, ymdToLocalDate, type YMD } from '@/shared/lib/dates'
import { cn } from '@/shared/lib/utils'
import { Calendar } from './ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { controlVariants } from './ui/variants'

export interface DatePickerProps {
  value: YMD | ''
  onChange: (value: YMD) => void
  min?: YMD
  max?: YMD
  highlight?: { from?: YMD; to?: YMD }
  placeholder?: string
  disabled?: boolean
  id?: string
  name?: string
  className?: string
  ref?: Ref<HTMLButtonElement>
  'aria-invalid'?: true | undefined
  'aria-describedby'?: string | undefined
}

export function DatePicker({
  value,
  onChange,
  min,
  max,
  highlight,
  placeholder = 'Pick a date',
  disabled,
  className,
  ref,
  ...trigger
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const selected = value ? ymdToLocalDate(value) : undefined
  const today = ymdToLocalDate(businessToday())

  const minDate = min ? ymdToLocalDate(min) : undefined
  const maxDate = max ? ymdToLocalDate(max) : undefined
  const blocked: Matcher[] = []
  if (minDate) blocked.push({ before: minDate })
  if (maxDate) blocked.push({ after: maxDate })

  const rangeFrom = highlight?.from ? ymdToLocalDate(highlight.from) : undefined
  const rangeTo = highlight?.to ? ymdToLocalDate(highlight.to) : undefined
  const inRange = rangeFrom && rangeTo && rangeFrom <= rangeTo ? { from: rangeFrom, to: rangeTo } : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          ref={ref}
          type="button"
          data-slot="date-picker-trigger"
          className={cn(
            controlVariants(),
            'cursor-pointer justify-between gap-2 text-left',
            !selected && 'text-muted',
            className,
          )}
          {...trigger}
        >
          <span className="truncate tabular-nums">{selected ? formatCalendarDate(value) : placeholder}</span>
          <CalendarDays aria-hidden="true" className="size-4 shrink-0 text-muted" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-2">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected ?? minDate ?? today}
          today={today}
          disabled={blocked}
          modifiers={inRange ? { inRange, rangeStart: inRange.from, rangeEnd: inRange.to } : undefined}
          modifiersClassNames={{
            inRange: '*:rounded-none *:bg-action-soft/60 first:*:rounded-l-control last:*:rounded-r-control',
            rangeStart: '*:rounded-l-control',
            rangeEnd: '*:rounded-r-control',
          }}
          onSelect={(date) => {
            if (!date) return
            onChange(localDateToYmd(date))
            setOpen(false)
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
