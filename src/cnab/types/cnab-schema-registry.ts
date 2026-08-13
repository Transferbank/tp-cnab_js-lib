import { CnabBankCode } from './cnab-bank-code'
import { CnabFormat } from './cnab-format'
import { CnabSchema } from './cnab-schema'
import { BradescoCnab240Schema } from '@cnab/banks/bradesco/schemas/240/cnab240-schema'
import { BradescoCnab400Schema } from '@cnab/banks/bradesco/schemas/400/cnab400-schema'

export const cnab240Schemas: Record<string, CnabSchema> = {
  [CnabBankCode.BRADESCO]: BradescoCnab240Schema
}

export const cnab400Schemas: Record<string, CnabSchema> = {
  [CnabBankCode.BRADESCO]: BradescoCnab400Schema
}

export function getSchema(bankCode: CnabBankCode, format: CnabFormat): CnabSchema {
  const schema = format === CnabFormat.CNAB240
    ? cnab240Schemas[bankCode]
    : cnab400Schemas[bankCode]

  if (schema == null) {
    throw new Error(`Schema não encontrado para banco ${bankCode} e formato ${format}`)
  }

  return schema
}
