function isValidDate(date: Date, year: number, month: number, day: number): boolean {
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

export function parseDateDDMMAA(str: string): Date | null {
  if (str == null || str.length !== 6 || !/^\d{6}$/.test(str)) return null

  const day = parseInt(str.substring(0, 2), 10)
  const month = parseInt(str.substring(2, 4), 10)
  const year = 2000 + parseInt(str.substring(4, 6), 10)

  const date = new Date(year, month - 1, day)

  return isValidDate(date, year, month, day) ? date : null
}

export function parseDateDDMMAAAA(str: string): Date | null {
  if (str == null || str.length !== 8 || !/^\d{8}$/.test(str)) return null

  const day = parseInt(str.substring(0, 2), 10)
  const month = parseInt(str.substring(2, 4), 10)
  const year = parseInt(str.substring(4, 8), 10)

  const date = new Date(year, month - 1, day)

  return isValidDate(date, year, month, day) ? date : null
}

