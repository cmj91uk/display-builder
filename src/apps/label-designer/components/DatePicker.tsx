import { useEffect, useId, useRef, useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { CONTROL_SHELL_CLASS, SELECT_MENU_TRIGGER_CLASS } from './SelectMenu'

type DatePickerProps = {
  id?: string
  value: string
  onChange: (value: string) => void
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function fromIsoDate(value: string): Date | null {
  if (!value) {
    return null
  }
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) {
    return null
  }
  return new Date(year, month - 1, day)
}

function formatDisplayDate(value: string): string {
  const date = fromIsoDate(value)
  if (!date) {
    return 'Choose a date'
  }
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function DatePicker({ id, value, onChange }: DatePickerProps) {
  const calendarId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const selected = fromIsoDate(value)

  useEffect(() => {
    if (!open) {
      return
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className={CONTROL_SHELL_CLASS}>
      <button
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={calendarId}
        onClick={() => setOpen((current) => !current)}
        className={SELECT_MENU_TRIGGER_CLASS}
      >
        <span
          className={[
            'truncate',
            value ? 'text-ink' : 'font-normal text-muted',
          ].join(' ')}
        >
          {formatDisplayDate(value)}
        </span>
        <span className="shrink-0 text-muted" aria-hidden="true">
          <svg
            viewBox="0 0 16 16"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="2" y="3.5" width="12" height="10.5" rx="1.5" />
            <path d="M2 6.5h12M5.5 2v3M10.5 2v3" />
          </svg>
        </span>
      </button>

      {open ? (
        <div
          id={calendarId}
          role="dialog"
          aria-label="Choose a date"
          className="absolute top-full left-0 z-30 mt-1 rounded-lg border border-beige-dark/40 bg-white p-2 shadow-lg"
        >
          <Calendar
            locale="en-GB"
            calendarType="iso8601"
            className="label-date-calendar"
            value={selected}
            onChange={(nextValue) => {
              if (!(nextValue instanceof Date)) {
                return
              }
              onChange(toIsoDate(nextValue))
              setOpen(false)
            }}
          />
        </div>
      ) : null}
    </div>
  )
}
