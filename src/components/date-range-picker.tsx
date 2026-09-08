import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  formatCareerDateRange,
  formatIsoDate,
  parseIsoDate,
} from '@/lib/career-step/dates'
import { cn } from '@/lib/utils'

export type DateRangeValue = {
  from: string
  to: string
}

type DateRangePickerProps = {
  id?: string
  value: DateRangeValue
  onChange: (value: DateRangeValue) => void
  onBlur?: () => void
  'aria-invalid'?: boolean
}

export function DateRangePicker({
  id,
  value,
  onChange,
  onBlur,
  'aria-invalid': ariaInvalid,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const selected = value.from
    ? {
        from: parseIsoDate(value.from),
        to: parseIsoDate(value.to),
      }
    : undefined

  return (
    <Popover
      modal
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) onBlur?.()
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          aria-invalid={ariaInvalid}
          className={cn(
            'w-full justify-start text-left font-normal',
            !value.from && 'text-muted-foreground',
          )}
        >
          <CalendarIcon />
          {value.from
            ? formatCareerDateRange(value.from, value.to || null)
            : 'Select dates'}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="range"
          numberOfMonths={1}
          selected={selected}
          onSelect={(range) => {
            if (!range?.from) {
              onChange({ from: '', to: '' })
              return
            }

            const from = formatIsoDate(range.from)
            const to = range.to ? formatIsoDate(range.to) : ''

            // DayPicker sets to === from on the first click. Treat that as an
            // open range (Present) until a different end date is chosen.
            if (to === from && !value.to) {
              onChange({ from, to: '' })
              return
            }

            onChange({ from, to })
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
