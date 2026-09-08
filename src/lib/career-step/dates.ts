const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

const displayFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export function parseIsoDate(value: string): Date | undefined {
  const match = ISO_DATE.exec(value)
  if (!match) return undefined

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined
  }

  return date
}

export function formatIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatCareerDateRange(
  from: string,
  to: string | null | undefined,
): string {
  const start = parseIsoDate(from)
  if (!start) return ''

  const startLabel = displayFormatter.format(start)
  if (!to) return `${startLabel} – Present`

  const end = parseIsoDate(to)
  if (!end) return `${startLabel} – Present`

  return `${startLabel} – ${displayFormatter.format(end)}`
}
