import { DateFormat } from '@cnab/utils/date-parser'
import { isDigitsOnly } from '@cnab/utils/document-parser'

interface CnabValueTypes {
  text: string
  number: number
  date: Date
}

const VALUE_TYPE_DESCRIPTIONS: Record<keyof CnabValueTypes, string> = {
  text: 'texto',
  number: 'um número',
  date: 'uma data'
}

function isValueOfType(value: unknown, type: keyof CnabValueTypes): boolean {
  if (type == 'text') return typeof value == 'string'
  if (type == 'number') return typeof value == 'number' && Number.isFinite(value)
  return value instanceof Date && !Number.isNaN(value.getTime())
}

export function assertValueType<K extends keyof CnabValueTypes>(value: unknown, type: K): asserts value is CnabValueTypes[K] | null | undefined {
  if (value != null && !isValueOfType(value, type)) {
    throw new TypeError(`valor ${String(value)} deve ser ${VALUE_TYPE_DESCRIPTIONS[type]}`)
  }
}

export function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase()
}

export function formatAlphanumeric(value: string | null, length: number): string {
  const text = normalizeText(value ?? '')
  if (text.length > length) {
    throw new RangeError(`valor "${text}" não cabe em ${length} posições`)
  }
  return text.padEnd(length, ' ')
}

export function formatNumericText(value: string, length: number): string {
  if (value != '' && !isDigitsOnly(value)) {
    throw new RangeError(`valor "${value}" deve ter só dígitos`)
  }
  if (value.length > length) {
    throw new RangeError(`valor "${value}" não cabe em ${length} posições`)
  }
  return value.padStart(length, '0')
}

export function formatImpliedDecimal(value: number | null, length: number, decimals: number): string {
  if (value == null) {
    return '0'.repeat(length)
  }
  if (value < 0) {
    throw new RangeError(`valor ${value} negativo não pode ser escrito`)
  }

  const digits = String(Math.round(value * 10 ** decimals))
  if (digits.length > length) {
    throw new RangeError(`valor ${value} não cabe em ${length} posições`)
  }
  return digits.padStart(length, '0')
}

export function formatDate(value: Date | null, dateFormat: DateFormat): string {
  if (value == null) {
    return '0'.repeat(dateFormat == DateFormat.DDMMAA ? 6 : 8)
  }

  const fullYear = value.getFullYear()
  if (dateFormat == DateFormat.DDMMAA && (fullYear < 1950 || fullYear > 2049)) {
    throw new RangeError(`ano ${fullYear} não pode ser escrito com 2 dígitos`)
  }

  const day = String(value.getDate()).padStart(2, '0')
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const year = String(fullYear).padStart(4, '0')
  if (dateFormat == DateFormat.DDMMAA) return `${day}${month}${year.slice(-2)}`
  if (dateFormat == DateFormat.DDMMAAAA) return `${day}${month}${year}`
  return `${year}${month}${day}`
}
