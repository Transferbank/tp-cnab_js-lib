import { CNABFormatCode } from '@tp-types/index'
import {
  CNABNoLinesProvidedError,
  CNABInvalidHeaderError,
  CNABFormatNotRecognizedError,
  CNABBankNotFoundError,
} from '@tp-types/errors'
import { getCnab400BankCode, getCnab240BankCode } from '@parser/cnab-positions'

const LINE_LENGTH = {
  CNAB_240: 240,
  CNAB_400: 400,
} as const

export function detectFormat(lines: string[]): CNABFormatCode {
  const hasLines = lines && lines.length > 0
  if (!hasLines) {
    throw new CNABNoLinesProvidedError()
  }

  const len = lines[0].length

  const isCnab240 = len === LINE_LENGTH.CNAB_240
  if (isCnab240) return CNABFormatCode.CNAB240

  const isCnab400 = len === LINE_LENGTH.CNAB_400
  if (isCnab400) return CNABFormatCode.CNAB400

  throw new CNABFormatNotRecognizedError(len)
}

export function detectBank(headerLine: string, format: CNABFormatCode): string {
  const hasHeader = headerLine !== undefined && headerLine !== null && headerLine.length > 0
  if (!hasHeader) {
    throw new CNABInvalidHeaderError(headerLine)
  }

  const isCnab400 = format === CNABFormatCode.CNAB400
  if (isCnab400) {
    const bankCode = getCnab400BankCode(headerLine) || ''
    const found = bankCode.length > 0
    if (found) return bankCode
    throw new CNABBankNotFoundError(format)
  }

  const isCnab240 = format === CNABFormatCode.CNAB240
  if (isCnab240) {
    const bankCode = getCnab240BankCode(headerLine) || ''
    const found = bankCode.length > 0
    if (found) return bankCode
    throw new CNABBankNotFoundError(format)
  }

  throw new CNABBankNotFoundError(format)
}
