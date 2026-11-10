import { DayPicker, getDefaultClassNames, type ChevronProps, type DayPickerProps } from 'react-day-picker'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

const navButton = cn(
  'z-10 inline-flex size-9 cursor-pointer items-center justify-center rounded-control text-muted',
  'transition-colors duration-150 hover:bg-neutral-soft hover:text-ink',
  'disabled:pointer-events-none disabled:opacity-40',
)

function CalendarChevron({ orientation, className }: ChevronProps) {
  const Icon = orientation === 'left' ? ChevronLeft : ChevronRight
  return <Icon aria-hidden="true" className={cn('size-4', className)} />
}

function Calendar({ className, classNames, showOutsideDays = true, components, ...props }: DayPickerProps) {
  const defaults = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      weekStartsOn={1}
      className={cn('select-none', className)}
      classNames={{
        root: cn('w-fit', defaults.root),
        months: cn('relative flex flex-col gap-4', defaults.months),
        month: cn('flex w-full flex-col gap-2', defaults.month),
        nav: cn('absolute inset-x-0 top-0 flex items-center justify-between', defaults.nav),
        button_previous: cn(navButton, defaults.button_previous),
        button_next: cn(navButton, defaults.button_next),
        month_caption: cn('flex h-9 items-center justify-center px-10', defaults.month_caption),
        caption_label: cn('text-base font-semibold', defaults.caption_label),
        month_grid: cn('w-full border-collapse', defaults.month_grid),
        weekdays: cn('flex', defaults.weekdays),
        weekday: cn('w-10 pb-1 text-center text-label font-medium text-muted pointer-fine:w-9', defaults.weekday),
        week: cn('mt-0.5 flex w-full', defaults.week),
        day: cn('group/day relative size-10 p-0 text-center pointer-fine:size-9', defaults.day),
        day_button: cn(
          'relative flex size-full cursor-pointer items-center justify-center rounded-control text-sm text-ink tabular-nums',
          'transition-colors duration-100 hover:bg-neutral-soft',
          'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-action',
          'group-data-outside/day:text-muted',
          'group-data-today/day:font-semibold group-data-today/day:text-action-text',
          'after:absolute after:bottom-1 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-transparent',
          'group-data-today/day:after:bg-action',
          'group-data-selected/day:rounded-control group-data-selected/day:bg-action group-data-selected/day:font-semibold group-data-selected/day:text-action-ink',
          'group-data-selected/day:hover:bg-action group-data-today/day:group-data-selected/day:after:bg-action-ink',
          'disabled:cursor-not-allowed disabled:text-muted disabled:opacity-40 disabled:hover:bg-transparent',
          defaults.day_button,
        ),
        today: cn(defaults.today),
        selected: cn(defaults.selected),
        outside: cn(defaults.outside),
        disabled: cn(defaults.disabled),
        hidden: cn('invisible', defaults.hidden),
        ...classNames,
      }}
      components={{ Chevron: CalendarChevron, ...components }}
      {...props}
    />
  )
}

export { Calendar }
