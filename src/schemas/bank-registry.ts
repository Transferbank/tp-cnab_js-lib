import { BankSchema, CNABFormatCode, BANK_CODES, BankCode } from '@/types/all-types'
import { CNABSchemaNotFoundError } from '@/types/errors/error-types'

import { bradescoCnab400 } from '@/banks/bradesco/schemas/cnab400/schema-cnab400'
import { bradescoCnab240 } from '@/banks/bradesco/schemas/cnab240/schema-cnab240'

export const cnab400Banks: Partial<Record<BankCode, BankSchema>> = {
  [BANK_CODES.BRADESCO]: bradescoCnab400,
}

export const cnab240Banks: Partial<Record<BankCode, BankSchema>> = {
  [BANK_CODES.BRADESCO]: bradescoCnab240,
}

export function getBankSchema(bankCode: string, format: CNABFormatCode): BankSchema {
  const schema = format === CNABFormatCode.CNAB240
    ? cnab240Banks[bankCode as BankCode]
    : cnab400Banks[bankCode as BankCode]

  if (schema == null) {
    throw new CNABSchemaNotFoundError(bankCode, format)
  }

  return schema
}
