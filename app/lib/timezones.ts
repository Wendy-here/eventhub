export const TIMEZONE_KEYS = ['Vietnam / Thailand', 'Germany', 'Egypt'] as const
export type TzKey = typeof TIMEZONE_KEYS[number]

function lastSundayOf(year: number, month: number): Date {
  const d = new Date(Date.UTC(year, month + 1, 0))
  d.setUTCDate(d.getUTCDate() - d.getUTCDay())
  return d
}

// Germany: CET (UTC+1) in winter, CEST (UTC+2) in summer.
// Clocks spring forward last Sunday of March, fall back last Sunday of October.
function germanyOffset(dateStr: string): { offset: number; abbr: string } {
  const d = new Date(dateStr + 'T12:00:00Z')
  const y = d.getUTCFullYear()
  const isSummer = d >= lastSundayOf(y, 2) && d < lastSundayOf(y, 9)
  return isSummer ? { offset: 2, abbr: 'CEST' } : { offset: 1, abbr: 'CET' }
}

export function getOffset(tz: string, dateStr: string): { offset: number; abbr: string } {
  if (tz === 'Vietnam / Thailand') return { offset: 7, abbr: 'ICT' }
  if (tz === 'Egypt') return { offset: 2, abbr: 'EET' }
  if (tz === 'Germany') return germanyOffset(dateStr)
  return { offset: 0, abbr: 'UTC' }
}

export function convertTime(timeStr: string, fromOffset: number, toOffset: number): string {
  const [h, m] = timeStr.split(':').map(Number)
  const utcMins = h * 60 + m - fromOffset * 60
  const local = ((utcMins + toOffset * 60) % 1440 + 1440) % 1440
  return `${String(Math.floor(local / 60)).padStart(2, '0')}:${String(local % 60).padStart(2, '0')}`
}

export function allZoneTimes(timeStr: string, storedTz: string, dateStr: string) {
  const { offset: fromOffset } = getOffset(storedTz, dateStr)
  return TIMEZONE_KEYS.map(tz => {
    const { offset, abbr } = getOffset(tz, dateStr)
    return { tz, time: convertTime(timeStr, fromOffset, offset), abbr }
  })
}
