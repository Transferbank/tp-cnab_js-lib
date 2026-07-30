import { DateFormat } from '@tp-types/index'

export function parseDateDDMMAA(str: string): Date | null {
  const isInvalid = str === null || str === undefined || str.length !== 6 || !/^\d{6}$/.test(str)
  if (isInvalid) return null

  const day = parseInt(str.substring(0, 2), 10)
  const month = parseInt(str.substring(2, 4), 10)
  const year = 2000 + parseInt(str.substring(4, 6), 10)

  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return date
}

export function parseDateDDMMAAAA(str: string): Date | null {
  const isInvalid = str === null || str === undefined || str.length !== 8 || !/^\d{8}$/.test(str)
  if (isInvalid) return null

  const day = parseInt(str.substring(0, 2), 10)
  const month = parseInt(str.substring(2, 4), 10)
  const year = parseInt(str.substring(4, 8), 10)

  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return date
}

/**
 * Formato AAAAMMDD usado pelo Sicredi (diferente do DDMMAAAA padrão).
 */
export function parseDateAAAAMMDD(str: string): Date | null {
  const isInvalid = str === null || str === undefined || str.length !== 8 || !/^\d{8}$/.test(str)
  if (isInvalid) return null

  const year = parseInt(str.substring(0, 4), 10)
  const month = parseInt(str.substring(4, 6), 10)
  const day = parseInt(str.substring(6, 8), 10)

  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return date
}

export function parseDate(str: string, dateFormat: DateFormat | null): Date | null {
  if (dateFormat === 'DDMMAA') return parseDateDDMMAA(str)
  if (dateFormat === 'DDMMAAAA') return parseDateDDMMAAAA(str)
  if (dateFormat === 'AAAAMMDD') return parseDateAAAAMMDD(str)
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
