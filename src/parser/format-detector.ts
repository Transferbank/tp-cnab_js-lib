import { CNABFormatCode } from '@tp-types/index'
import { CNABNoLinesProvidedError, CNABInvalidHeaderError } from '@tp-types/errors'
import { getCnab400BankCode, getCnab240BankCode } from '@parser/cnab-positions'

const LINE_LENGTH = {
  CNAB_240: 240,
  CNAB_400: 400,
} as const

export function detectFormat(lines: string[]): CNABFormatCode | null {
  if (!lines || lines.length === 0) {
    throw new CNABNoLinesProvidedError()
  }

  const len = lines[0].length

  if (len === LINE_LENGTH.CNAB_240) return CNABFormatCode.CNAB240
  if (len === LINE_LENGTH.CNAB_400) return CNABFormatCode.CNAB400

  return null
}

export function detectBank(headerLine: string, format: CNABFormatCode): string | null {
  if (headerLine === undefined || headerLine === null || headerLine.length === 0) {
    throw new CNABInvalidHeaderError(headerLine)
  }

  if (format === CNABFormatCode.CNAB400) {
    return getCnab400BankCode(headerLine) || null
  }

  if (format === CNABFormatCode.CNAB240) {
    return getCnab240BankCode(headerLine) || null
  }

  return null
}
