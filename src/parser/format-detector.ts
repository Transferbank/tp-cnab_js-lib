import { CNABFormatCode } from '@/types/core/cnab'
import {
  CNABNoLinesProvidedError,
  CNABInvalidHeaderError,
  CNABFormatNotRecognizedError,
  CNABBankNotFoundError,
} from '@/types/errors/error-types'
import { getCnab400BankCode, getCnab240BankCode } from '@parser/cnab-positions'

const LINE_LENGTH = {
  CNAB_240: 240,
  CNAB_400: 400,
} as const

export function detectFormat(text: string[]): CNABFormatCode {
  if (text == null || text.length === 0) {
    throw new CNABNoLinesProvidedError()
  }

  const len = text[0].length
  if (len === LINE_LENGTH.CNAB_240) return CNABFormatCode.CNAB240
  if (len === LINE_LENGTH.CNAB_400) return CNABFormatCode.CNAB400

  throw new CNABFormatNotRecognizedError(len)
}

export function detectBank(header: string, format: CNABFormatCode): string {
  if (header == null || header.length === 0) {
    throw new CNABInvalidHeaderError(header)
  }

  if (format === CNABFormatCode.CNAB400) {
    const bankCode = getCnab400BankCode(header) || ''
    const found = bankCode.length > 0
    if (found) return bankCode
    throw new CNABBankNotFoundError(format)
  }

  if (format === CNABFormatCode.CNAB240) {
    const bankCode = getCnab240BankCode(header) || ''
    if (bankCode.length > 0) return bankCode
    throw new CNABBankNotFoundError(format)
  }

  throw new CNABBankNotFoundError(format)
}
