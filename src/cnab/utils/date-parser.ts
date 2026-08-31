export enum DateFormat {
  DDMMAA = 'DDMMAA',
  DDMMAAAA = 'DDMMAAAA',
  AAAAMMDD = 'AAAAMMDD'
}

function isValidDate(date: Date, year: number, month: number, day: number): boolean {
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

export function parseDateDDMMAA(str: string): Date | null {
  if (str == null || str.length !== 6 || !/^\d{6}$/.test(str)) return null
  const day = parseInt(str.substring(0, 2), 10)
  const month = parseInt(str.substring(2, 4), 10)
  const year = parseInt(str.substring(4, 6), 10)
  const fullYear = year >= 50 ? 1900 + year : 2000 + year
  const date = new Date(fullYear, month - 1, day)
  return isValidDate(date, fullYear, month, day) ? date : null
}

export function parseDateDDMMAAAA(str: string): Date | null {
  if (str == null || str.length !== 8 || !/^\d{8}$/.test(str)) return null
  const day = parseInt(str.substring(0, 2), 10)
  const month = parseInt(str.substring(2, 4), 10)
  const year = parseInt(str.substring(4, 8), 10)
  const date = new Date(year, month - 1, day)
  return isValidDate(date, year, month, day) ? date : null
}

export function parseDateAAAAMMDD(str: string): Date | null {
  if (str == null || str.length !== 8 || !/^\d{8}$/.test(str)) return null
  const year = parseInt(str.substring(0, 4), 10)
  const month = parseInt(str.substring(4, 6), 10)
  const day = parseInt(str.substring(6, 8), 10)
  const date = new Date(year, month - 1, day)
  return isValidDate(date, year, month, day) ? date : null
}

export function parseDate(str: string, dateFormat: DateFormat | null): Date | null {
  if (dateFormat === DateFormat.DDMMAA) return parseDateDDMMAA(str)
  if (dateFormat === DateFormat.DDMMAAAA) return parseDateDDMMAAAA(str)
  if (dateFormat === DateFormat.AAAAMMDD) return parseDateAAAAMMDD(str)
  return null
}

export function isDateInPast(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

export function formatDateBR(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}
