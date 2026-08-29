import type { DateFormat } from './label-spec'

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

function nthNumber(number: number): string {
  if (number > 3 && number < 21) return 'th'
  switch (number % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}

export function formatDate(type: DateFormat, date: Date): string {
  const day = date.getDate()
  const month = date.toLocaleString('default', { month: 'long' })
  const year = date.getFullYear()

  if (type === 'long') {
    return `${WEEKDAYS[date.getDay()]} ${day}${nthNumber(day)} ${month} ${year}`
  }

  return `${day}/${date.getMonth() + 1}/${year}`
}
